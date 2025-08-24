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
    fun handleUserCreated(event: UserCreatedEvent) {
        println("Processing user created event: ${event.userId} - ${event.name}")
        // Update assignable users cache or notification lists
        // In a real system, you might update a cache or send notifications

        // Example: Find all unassigned tasks and potentially suggest assignment
        val unassignedTasks = findUnassignedTasks()
        println("Found ${unassignedTasks.size} unassigned tasks that could be assigned to new user ${event.name}")
    }

    @EventHandler
    fun handleUserDeactivated(event: UserDeactivatedEvent) {
        println("Processing user deactivated event: ${event.userId}")

        // Find all tasks assigned to this user
        val userTasks = findTasksByAssignedUser(event.userId.value)

        userTasks.forEach { task ->
            println("Reassigning task ${task.taskId} from deactivated user ${event.userId}")

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

        println("Processed ${userTasks.size} tasks for deactivated user ${event.userId}")
    }

    @EventHandler
    fun handleUserNameUpdated(event: UserNameUpdatedEvent) {
        println("Processing user name updated event: ${event.userId} - ${event.name}")
        // Update local user data cache if maintained
    }

    @EventHandler
    fun handleUserEmailUpdated(event: UserEmailUpdatedEvent) {
        println("Processing user email updated event: ${event.userId} - ${event.email}")
        // Update local user data cache if maintained
    }

    @EventHandler
    fun handleUserRoleChanged(event: UserRoleChangedEvent) {
        println("Processing user role changed event: ${event.userId} - ${event.old_role} -> ${event.new_role}")
        // Update local user data cache if maintained
    }

    @EventHandler
    fun handleProjectCreated(event: ProjectCreatedEvent) {
        println("Processing project created event: ${event.projectId} - ${event.title}")

        // Create default tasks for new project
        createDefaultTasksForProject(event.projectId, event.title.value, event.workspaceId)
    }

    @EventHandler
    fun handleProjectStatusUpdated(event: ProjectStatusUpdatedEvent) {
        println("Processing project status change: ${event.projectId} -> ${event.status}")

        // Update task statuses based on project status
        when (event.status) {
            ProjectStatus.COMPLETED -> {
                completeAllProjectTasks(event.projectId)
            }
            ProjectStatus.CANCELLED -> {
                cancelAllProjectTasks(event.projectId)
            }
            else -> {
                // No action needed for PLANNING or IN_PROGRESS statuses
            }
        }
    }

    @EventHandler
    fun handleProjectDeleted(event: ProjectDeletedEvent) {
        println("Processing project deleted event: ${event.projectId}")

        // Archive or soft delete all tasks in the project
        val projectTasks = findTasksByProject(event.projectId)

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

        println("Processed ${projectTasks.size} tasks for deleted project ${event.projectId}")
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

    private fun createDefaultTasksForProject(projectId: ProjectId, projectName: String, workspaceId: WorkspaceId) {
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
            val command = CreateTaskCommand(
                taskId = taskId,
                title = TaskTitle(title),
                description = TaskDescription(description),
                workspaceId = workspaceId,
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
