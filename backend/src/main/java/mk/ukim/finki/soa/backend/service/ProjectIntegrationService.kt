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
open class ProjectIntegrationService(
    private val projectViewRepository: ProjectViewRepository,
    private val taskViewRepository: TaskViewRepository,
    private val commandGateway: CommandGateway
) {

    @EventHandler
    fun handleWorkspaceArchived(workspaceId: String) {
        println("Processing workspace archived event: $workspaceId")

        // Archive all projects in the workspace
        val workspaceProjects = findProjectsByWorkspace(WorkspaceId(workspaceId))

        workspaceProjects.forEach { project ->
            if (!project.archived) {
                val command = ArchiveProjectCommand(project.projectId)
                commandGateway.send<Any>(command)
                    .thenRun {
                        println("Successfully archived project ${project.projectId}")
                    }
                    .exceptionally { ex ->
                        println("Failed to archive project ${project.projectId}: ${ex.message}")
                        null
                    }
            }
        }
    }

    @EventHandler
    fun handleWorkspaceDeleted(workspaceId: String) {
        println("Processing workspace deleted event: $workspaceId")

        // Soft delete all projects in the workspace
        val workspaceProjects = findProjectsByWorkspace(WorkspaceId(workspaceId))

        workspaceProjects.forEach { project ->
            val command = DeleteProjectCommand(project.projectId)
            commandGateway.send<Any>(command)
                .thenRun {
                    println("Successfully deleted project ${project.projectId}")
                }
                .exceptionally { ex ->
                    println("Failed to delete project ${project.projectId}: ${ex.message}")
                    null
                }
        }
    }

    @EventHandler
    fun handleUserRoleChanged(userId: String, oldRole: String, newRole: String) {
        println("Processing user role change: $userId from $oldRole to $newRole")

        // If user lost project management permissions, reassign project ownership
        if (oldRole == "ADMIN" && newRole != "ADMIN") {
            reassignProjectsFromUser(userId)
        }
    }

    @EventHandler
    fun handleTaskCompleted(taskId: String, projectId: String) {
        println("Processing task completed event: $taskId in project $projectId")

        // Check if all tasks in project are completed
        val projectTasks = findTasksByProject(ProjectId(projectId))
        val completedTasks = projectTasks.filter { it.status == TaskStatus.COMPLETED }

        if (completedTasks.size == projectTasks.size && projectTasks.isNotEmpty()) {
            println("All tasks completed in project $projectId. Updating project status.")
            val command = UpdateProjectStatusCommand(ProjectId(projectId), ProjectStatus.COMPLETED)
            commandGateway.send<Any>(command)
        }
    }

    @EventHandler
    fun handleProjectDeadlineApproaching(projectId: String, daysRemaining: Int) {
        println("Project deadline approaching: $projectId has $daysRemaining days remaining")

        // Could trigger notifications, status updates, or priority changes
        if (daysRemaining <= 3) {
            // Increase priority of all pending tasks
            val pendingTasks = findTasksByProject(ProjectId(projectId))
                .filter { it.status == TaskStatus.PENDING }

            pendingTasks.forEach { task ->
                if (task.priority != TaskPriority.HIGH) {
                    val command = ChangeTaskPriorityCommand(task.taskId, TaskPriority.HIGH)
                    commandGateway.send<Any>(command)
                }
            }
        }
    }

    // Helper methods
    private fun findProjectsByWorkspace(workspaceId: WorkspaceId): List<ProjectView> {
        val spec = ProjectSpecifications.hasWorkspaceId(workspaceId)!!
            .and(ProjectSpecifications.isNotDeleted())
        return projectViewRepository.findAll(spec)
    }

    private fun findTasksByProject(projectId: ProjectId): List<TaskView> {
        val spec = TaskSpecifications.hasProjectId(projectId)!!
            .and(TaskSpecifications.isNotDeleted())
        return taskViewRepository.findAll(spec)
    }

    private fun reassignProjectsFromUser(userId: String) {
        val userProjects = findProjectsByOwner(userId)

        userProjects.forEach { project ->
            // Find a suitable replacement owner (could be workspace owner or admin)
            val command = UpdateProjectOwnerCommand(project.projectId, "admin") // Simplified
            commandGateway.send<Any>(command)
                .thenRun {
                    println("Reassigned project ${project.projectId} from user $userId")
                }
        }
    }

    private fun findProjectsByOwner(ownerId: String): List<ProjectView> {
        val spec = ProjectSpecifications.hasOwnerId(ownerId)!!
            .and(ProjectSpecifications.isNotDeleted())
        return projectViewRepository.findAll(spec)
    }
}

