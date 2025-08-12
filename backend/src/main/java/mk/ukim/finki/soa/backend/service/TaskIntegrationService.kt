package mk.ukim.finki.soa.backend.service

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.repository.*
import mk.ukim.finki.soa.backend.specification.*
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.eventhandling.EventHandler
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
@Transactional
open class TaskIntegrationService(
    private val taskViewRepository: TaskViewRepository,
    private val commandGateway: CommandGateway
) {

    @EventHandler
    fun handleUserCreated(userId: String, userName: String) {
        println("Processing user created event: $userId - $userName")
        // Update assignable users cache or notification lists
        // In a real system, you might update a cache or send notifications

        // Example: Find all unassigned tasks and potentially suggest assignment
        val unassignedTasks = findUnassignedTasks()
        println("Found ${unassignedTasks.size} unassigned tasks that could be assigned to new user $userName")
    }

    @EventHandler
    fun handleUserDeactivated(userId: String) {
        println("Processing user deactivated event: $userId")

        // Find all tasks assigned to this user
        val userTasks = findTasksByAssignedUser(userId)

        userTasks.forEach { task ->
            println("Reassigning task ${task.taskId} from deactivated user $userId")

            // Remove assignment from deactivated user
            val command = RemoveTaskAssigneeCommand(task.taskId)
            commandGateway.send<Any>(command)
                .thenRun {
                    println("Successfully unassigned task ${task.taskId}")
                }
                .exceptionally { ex ->
                    println("Failed to unassign task ${task.taskId}: ${ex.message}")
                    null
                }
        }

        println("Processed ${userTasks.size} tasks for deactivated user $userId")
    }

    @EventHandler
    fun handleUserUpdated(userId: String, userData: Map<String, Any>) {
        println("Processing user updated event: $userId")

        // Update local user data cache if maintained
        val userName = userData["name"] as? String
        val userRole = userData["role"] as? String
        val userActive = userData["active"] as? Boolean

        println("Updated user data: name=$userName, role=$userRole, active=$userActive")

        // If user became inactive, handle like deactivation
        if (userActive == false) {
            handleUserDeactivated(userId)
        }
    }

    @EventHandler
    fun handleProjectCreated(projectId: String, projectName: String) {
        println("Processing project created event: $projectId - $projectName")

        // Create default tasks for new project
        createDefaultTasksForProject(ProjectId(projectId), projectName)
    }

    @EventHandler
    fun handleProjectStatusChanged(projectId: String, newStatus: String) {
        println("Processing project status change: $projectId -> $newStatus")

        // Update task statuses based on project status
        when (newStatus.uppercase()) {
            "COMPLETED" -> {
                completeAllProjectTasks(ProjectId(projectId))
            }
            "CANCELLED" -> {
                cancelAllProjectTasks(ProjectId(projectId))
            }
            "ON_HOLD" -> {
                pauseAllProjectTasks(ProjectId(projectId))
            }
        }
    }

    @EventHandler
    fun handleProjectDeleted(projectId: String) {
        println("Processing project deleted event: $projectId")

        // Archive or soft delete all tasks in the project
        val projectTasks = findTasksByProject(ProjectId(projectId))

        projectTasks.forEach { task ->
            val command = DeleteTaskCommand(task.taskId)
            commandGateway.send<Any>(command)
                .thenRun {
                    println("Successfully deleted task ${task.taskId}")
                }
                .exceptionally { ex ->
                    println("Failed to delete task ${task.taskId}: ${ex.message}")
                    null
                }
        }

        println("Processed ${projectTasks.size} tasks for deleted project $projectId")
    }

    fun handleNotificationDelivered(taskId: String?, userId: String) {
        println("Notification delivered for task: $taskId to user: $userId")

        // Update notification status or metrics
        // In a real system, you might update a notification tracking table
        if (taskId != null) {
            // Could add a comment to the task about notification delivery
            val comment = "Notification delivered to user $userId"
            // This would require extending the task model to track notifications
        }
    }

    fun handleNotificationFailed(taskId: String?, userId: String, reason: String) {
        println("Notification failed for task: $taskId to user: $userId. Reason: $reason")

        // Implement retry logic or alternative notification methods
        if (taskId != null) {
            scheduleNotificationRetry(taskId, userId, reason)
        }
    }

    // Helper methods
    private fun findUnassignedTasks(): List<TaskView> {
        val spec = TaskSpecifications.hasAssignedUserId(null)!!
            .and(TaskSpecifications.isNotDeleted())
        return taskViewRepository.findAll(spec)
    }

    private fun findTasksByAssignedUser(userId: String): List<TaskView> {
        val spec = TaskSpecifications.hasAssignedUserId(userId)!!
            .and(TaskSpecifications.isNotDeleted())
        return taskViewRepository.findAll(spec)
    }

    private fun findTasksByProject(projectId: ProjectId): List<TaskView> {
        val spec = TaskSpecifications.hasProjectId(projectId)!!
            .and(TaskSpecifications.isNotDeleted())
        return taskViewRepository.findAll(spec)
    }

    private fun createDefaultTasksForProject(projectId: ProjectId, projectName: String) {
        val defaultTasks = listOf(
            "Project Setup" to "Initialize project structure and documentation",
            "Requirements Analysis" to "Analyze and document project requirements",
            "Design Phase" to "Create system design and architecture",
            "Implementation" to "Core implementation phase",
            "Testing" to "Testing and quality assurance",
            "Deployment" to "Deploy to production environment"
        )

        defaultTasks.forEach { (title, description) ->
            val taskId = TaskId(UUID.randomUUID().toString())
            // You'd need to get workspace ID from project
            // This is simplified - in reality you'd query the project first
            val command = CreateTaskCommand(
                taskId = taskId,
                title = TaskTitle(title),
                description = TaskDescription(description),
                workspaceId = WorkspaceId(""), // Would need to resolve from project
                projectId = projectId,
                priority = TaskPriority.MEDIUM,
                deadline = null,
                recurrenceRule = null,
                tags = emptyList(),
                categories = listOf(Category(UUID.randomUUID().toString(), "Default"))
            )

            commandGateway.send<Any>(command)
        }
    }

    private fun completeAllProjectTasks(projectId: ProjectId) {
        val activeTasks = findTasksByProject(projectId)
            .filter { it.status != TaskStatus.COMPLETED && it.status != TaskStatus.CANCELLED }

        activeTasks.forEach { task ->
            val command = CompleteTaskCommand(task.taskId)
            commandGateway.send<Any>(command)
        }
    }

    private fun cancelAllProjectTasks(projectId: ProjectId) {
        val activeTasks = findTasksByProject(projectId)
            .filter { it.status != TaskStatus.COMPLETED && it.status != TaskStatus.CANCELLED }

        activeTasks.forEach { task ->
            val command = UpdateTaskStatusCommand(task.taskId, TaskStatus.CANCELLED)
            commandGateway.send<Any>(command)
        }
    }

    private fun pauseAllProjectTasks(projectId: ProjectId) {
        val activeTasks = findTasksByProject(projectId)
            .filter { it.status == TaskStatus.IN_PROGRESS }

        activeTasks.forEach { task ->
            val command = UpdateTaskStatusCommand(task.taskId, TaskStatus.PENDING)
            commandGateway.send<Any>(command)
        }
    }

    private fun scheduleNotificationRetry(taskId: String, userId: String, reason: String) {
        // Implementation for retry logic
        // Could use a message queue, scheduler, or event store
        println("Scheduling retry for notification: taskId=$taskId, userId=$userId, reason=$reason")

        // Example: Add a comment to the task about failed notification
        val command = AddCommentCommand(
            taskId = TaskId(taskId),
            commentId = UUID.randomUUID().toString(),
            authorId = "system",
            content = "Notification failed for user $userId: $reason. Retry scheduled."
        )
        commandGateway.send<Any>(command)
    }
}
