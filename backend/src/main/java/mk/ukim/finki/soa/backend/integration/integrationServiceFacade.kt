package mk.ukim.finki.soa.backend.integration
//
//import mk.ukim.finki.soa.backend.integration.*
//import mk.ukim.finki.soa.backend.integration.service.*
//import mk.ukim.finki.soa.backend.model.*
//import org.springframework.stereotype.Service
//import java.time.LocalDateTime
//
///**
// * Comprehensive integration facade that provides a unified API
// * for all workspace, project, and task operations across services
// */
//@Service
//class IntegrationFacadeService(
//    private val workspaceIntegrationService: WorkspaceIntegrationService,
//    private val projectIntegrationService: ProjectIntegrationService,
//    private val taskIntegrationService: TaskIntegrationService
//) {
//
//    // ===== USER-CENTRIC OPERATIONS =====
//
//    /**
//     * Get all user-related data for dashboard/overview purposes
//     */
//    fun getUserOverview(userId: String): Map<String, Any> {
//        val workspaces = workspaceIntegrationService.getWorkspacesByUser(userId)
//        val ownedProjects = projectIntegrationService.getProjectsByOwner(userId)
//        val assignedTasks = taskIntegrationService.getTasksByAssignedUser(userId)
//        val overdueTasks = assignedTasks.filter { task ->
//            task.deadline != null &&
//                    LocalDateTime.parse(task.deadline).isBefore(LocalDateTime.now()) &&
//                    task.status != TaskStatus.COMPLETED.name &&
//                    task.status != TaskStatus.CANCELLED.name
//        }
//
//        return mapOf(
//            "userId" to userId,
//            "workspaceCount" to workspaces.size,
//            "activeWorkspaceCount" to workspaces.count { !it.archived },
//            "projectCount" to ownedProjects.size,
//            "activeProjectCount" to ownedProjects.count { !it.archived },
//            "assignedTaskCount" to assignedTasks.size,
//            "overdueTaskCount" to overdueTasks.size,
//            "workspaces" to workspaces,
//            "recentProjects" to ownedProjects.take(5),
//            "recentTasks" to assignedTasks.take(10),
//            "overdueTasks" to overdueTasks
//        )
//    }
//
//    /**
//     * Handle user deactivation across all entities
//     */
//    fun handleUserDeactivation(userId: String): Map<String, Any> {
//        val workspaces = workspaceIntegrationService.getWorkspacesByOwner(userId)
//        val projects = projectIntegrationService.getProjectsByOwner(userId)
//        val taskInfo = taskIntegrationService.handleUserDeactivation(userId)
//
//        return mapOf(
//            "userId" to userId,
//            "affectedWorkspaces" to workspaces.map { it.workspaceId },
//            "affectedProjects" to projects.map { it.projectId },
//            "taskDeactivationInfo" to taskInfo
//        )
//    }
//
//    // ===== WORKSPACE-CENTRIC OPERATIONS =====
//
//    /**
//     * Get complete workspace information including projects and tasks
//     */
//    fun getWorkspaceDetails(workspaceId: String): Map<String, Any> {
//        val workspace = workspaceIntegrationService.getWorkspace(workspaceId)
//            ?: throw NoSuchElementException("Workspace not found: $workspaceId")
//
//        val projects = projectIntegrationService.getProjectsByWorkspace(workspaceId)
//        val tasks = taskIntegrationService.getTasksByWorkspace(workspaceId)
//        val projectStats = projectIntegrationService.getWorkspaceProjectStatistics(workspaceId)
//
//        return mapOf(
//            "workspace" to workspace,
//            "projects" to projects,
//            "projectCount" to projects.size,
//            "taskCount" to tasks.size,
//            "projectStatistics" to projectStats,
//            "recentTasks" to tasks.sortedByDescending { it.createdAt }.take(10),
//            "overdueTasks" to tasks.filter { task ->
//                task.deadline != null &&
//                        LocalDateTime.parse(task.deadline).isBefore(LocalDateTime.now()) &&
//                        task.status != TaskStatus.COMPLETED.name
//            }
//        )
//    }
//
//    /**
//     * Handle workspace archival with cascading effects
//     */
//    fun handleWorkspaceArchival(workspaceId: String): Map<String, Any> {
//        val projects = projectIntegrationService.getActiveProjectsByWorkspace(workspaceId)
//        val activeTasks = taskIntegrationService.getTasksWithFilters(
//            workspaceId = workspaceId,
//            includeCompleted = false,
//            includeCancelled = false
//        )
//
//        return mapOf(
//            "workspaceId" to workspaceId,
//            "affectedProjects" to projects.map { it.projectId },
//            "affectedTasks" to activeTasks.map { it.taskId },
//            "projectCount" to projects.size,
//            "taskCount" to activeTasks.size
//        )
//    }
//
//    // ===== PROJECT-CENTRIC OPERATIONS =====
//
//    /**
//     * Get complete project information including tasks and statistics
//     */
//    fun getProjectDetails(projectId: String): Map<String, Any> {
//        val project = projectIntegrationService.getProject(projectId)
//            ?: throw NoSuchElementException("Project not found: $projectId")
//
//        val tasks = taskIntegrationService.getTasksByProject(projectId)
//        val taskStats = taskIntegrationService.getTaskStatistics(projectId)
//        val unassignedTasks = taskIntegrationService.getUnassignedTasksByProject(projectId)
//        val overdueTasks = tasks.filter { task ->
//            task.deadline != null &&
//                    LocalDateTime.parse(task.deadline).isBefore(LocalDateTime.now()) &&
//                    task.status != TaskStatus.COMPLETED.name
//        }
//
//        return mapOf(
//            "project" to project,
//            "tasks" to tasks,
//            "taskStatistics" to taskStats,
//            "unassignedTasks" to unassignedTasks,
//            "overdueTasks" to overdueTasks,
//            "recentTasks" to tasks.sortedByDescending { it.createdAt }.take(5)
//        )
//    }
//
//    /**
//     * Handle project completion with task validation
//     */
//    fun handleProjectCompletion(projectId: String): Map<String, Any> {
//        val incompleteTasks = taskIntegrationService.getTasksWithFilters(
//            projectId = projectId,
//            includeCompleted = false,
//            includeCancelled = false
//        )
//
//        return mapOf(
//            "projectId" to projectId,
//            "incompleteTaskCount" to incompleteTasks.size,
//            "incompleteTasks" to incompleteTasks.map {
//                mapOf(
//                    "taskId" to it.taskId,
//                    "title" to it.title,
//                    "status" to it.status,
//                    "assignedUserId" to it.assignedUserId
//                )
//            },
//            "canComplete" to incompleteTasks.isEmpty()
//        )
//    }
//
//    // ===== NOTIFICATION AND REMINDER OPERATIONS =====
//
//    /**
//     * Get tasks requiring notifications (deadlines, overdue, etc.)
//     */
//    fun getTasksForNotification(
//        hoursAhead: Long = 24,
//        workspaceId: String? = null
//    ): Map<String, List<TaskIntegration>> {
//        val upcomingDeadline = LocalDateTime.now().plusHours(hoursAhead)
//        val upcomingTasks = taskIntegrationService.getUpcomingDeadlineTasks(upcomingDeadline)
//        val overdueTasks = taskIntegrationService.getOverdueTasks()
//
//        val filteredUpcoming = workspaceId?.let { wsId ->
//            upcomingTasks.filter { it.workspaceId == wsId }
//        } ?: upcomingTasks
//
//        val filteredOverdue = workspaceId?.let { wsId ->
//            overdueTasks.filter { it.workspaceId == wsId }
//        } ?: overdueTasks
//
//        return mapOf(
//            "upcomingDeadlines" to filteredUpcoming,
//            "overdueTasks" to filteredOverdue
//        )
//    }
//
//    /**
//     * Get dashboard data for a user across all their workspaces
//     */
//    fun getUserDashboard(userId: String): Map<String, Any> {
//        val userWorkspaces = workspaceIntegrationService.getWorkspacesByUser(userId, archived = false)
//        val assignedTasks = taskIntegrationService.getTasksByAssignedUser(userId)
//        val ownedProjects = projectIntegrationService.getProjectsByOwner(userId)
//
//        val urgentTasks = assignedTasks.filter { task ->
//            task.priority == TaskPriority.HIGH.name || task.priority == TaskPriority.CRITICAL.name
//        }
//
//        val todayDeadlines = assignedTasks.filter { task ->
//            task.deadline != null &&
//                    LocalDateTime.parse(task.deadline).toLocalDate() == LocalDateTime.now().toLocalDate()
//        }
//
//        return mapOf(
//            "user" to mapOf("userId" to userId),
//            "workspaces" to userWorkspaces,
//            "workspaceCount" to userWorkspaces.size,
//            "totalAssignedTasks" to assignedTasks.size,
//            "activeTaskCount" to assignedTasks.count {
//                it.status != TaskStatus.COMPLETED.name && it.status != TaskStatus.CANCELLED.name
//            },
//            "urgentTasks" to urgentTasks,
//            "todayDeadlines" to todayDeadlines,
//            "ownedProjectCount" to ownedProjects.size,
//            "recentActivity" to assignedTasks.sortedByDescending { it.lastModifiedAt ?: it.createdAt }.take(5)
//        )
//    }
//
//    // ===== BULK OPERATIONS =====
//
//    /**
//     * Get summary statistics across all entities for reporting
//     */
//    fun getSystemSummary(): Map<String, Any> {
//        val allWorkspaces = workspaceIntegrationService.getActiveWorkspaces()
//        val allOverdueTasks = taskIntegrationService.getOverdueTasks()
//
//        val workspaceStats = allWorkspaces.map { workspace ->
//            mapOf(
//                "workspaceId" to workspace.workspaceId,
//                "title" to workspace.title,
//                "memberCount" to workspace.memberIds.size,
//                "projectCount" to projectIntegrationService.countByWorkspaceId(workspace.workspaceId),
//                "taskCount" to taskIntegrationService.countByWorkspaceId(workspace.workspaceId)
//            )
//        }
//
//        return mapOf(
//            "activeWorkspaceCount" to allWorkspaces.size,
//            "totalOverdueTaskCount" to allOverdueTasks.size,
//            "workspaceBreakdown" to workspaceStats,
//            "systemHealth" to mapOf(
//                "hasOverdueTasks" to allOverdueTasks.isNotEmpty(),
//                "averageTasksPerWorkspace" to if (allWorkspaces.isNotEmpty()) {
//                    workspaceStats.sumOf { (it["taskCount"] as Long).toInt() } / allWorkspaces.size
//                } else 0
//            )
//        )
//    }
//
//    /**
//     * Validate entity relationships and permissions
//     */
//    fun validateEntityAccess(
//        userId: String,
//        workspaceId: String? = null,
//        projectId: String? = null,
//        taskId: String? = null
//    ): Map<String, Boolean> {
//        val results = mutableMapOf<String, Boolean>()
//
//        workspaceId?.let { wsId ->
//            results["hasWorkspaceAccess"] = workspaceIntegrationService.hasUserAccess(wsId, userId)
//        }
//
//        projectId?.let { pId ->
//            val project = projectIntegrationService.getProject(pId)
//            results["hasProjectAccess"] = project?.let { proj ->
//                workspaceIntegrationService.hasUserAccess(proj.workspaceId, userId)
//            } ?: false
//        }
//
//        taskId?.let { tId ->
//            val task = taskIntegrationService.getTask(tId)
//            results["hasTaskAccess"] = task?.let { t ->
//                workspaceIntegrationService.hasUserAccess(t.workspaceId, userId) ||
//                        t.assignedUserId == userId
//            } ?: false
//        }
//
//        return results
//    }
//
//    /**
//     * Get entities for data export
//     */
//    fun exportWorkspaceData(workspaceId: String, userId: String): Map<String, Any> {
//        if (!workspaceIntegrationService.hasUserAccess(workspaceId, userId)) {
//            throw IllegalAccessException("User does not have access to workspace: $workspaceId")
//        }
//
//        val workspace = workspaceIntegrationService.getWorkspace(workspaceId)
//            ?: throw NoSuchElementException("Workspace not found: $workspaceId")
//
//        val projects = projectIntegrationService.getProjectsByWorkspace(workspaceId)
//        val tasks = taskIntegrationService.getTasksByWorkspace(workspaceId)
//
//        return mapOf(
//            "exportTimestamp" to LocalDateTime.now().toString(),
//            "workspace" to workspace,
//            "projects" to projects,
//            "tasks" to tasks,
//            "summary" to mapOf(
//                "projectCount" to projects.size,
//                "taskCount" to tasks.size,
//                "memberCount" to workspace.memberIds.size,
//                "completedTaskCount" to tasks.count { it.status == TaskStatus.COMPLETED.name }
//            )
//        )
//    }
//}