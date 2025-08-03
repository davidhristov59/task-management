package mk.ukim.finki.soa.backend.model.event
import java.time.Instant

// Base external event class
abstract class ExternalEvent(
    open val eventId: String,
    open val eventType: String,
    open val timestamp: Instant = Instant.now(),
    open val source: String = "task-management-service",
    open val version: String = "1.0"
)

// Workspace External Events
data class WorkspaceCreatedExternalEvent(
    override val eventId: String,
    val workspaceId: String,
    val title: String,
    val description: String?,
    val ownerId: String,
    val memberIds: List<String>
) : ExternalEvent(eventId, "workspace_created")

data class WorkspaceMemberAddedExternalEvent(
    override val eventId: String,
    val workspaceId: String,
    val memberId: String,
    val addedBy: String
) : ExternalEvent(eventId, "workspace_member_added")

data class WorkspaceMemberRemovedExternalEvent(
    override val eventId: String,
    val workspaceId: String,
    val memberId: String,
    val removedBy: String
) : ExternalEvent(eventId, "workspace_member_removed")

data class WorkspaceArchivedExternalEvent(
    override val eventId: String,
    val workspaceId: String,
    val archivedBy: String
) : ExternalEvent(eventId, "workspace_archived")

data class WorkspaceDeletedExternalEvent(
    override val eventId: String,
    val workspaceId: String,
    val deletedBy: String
) : ExternalEvent(eventId, "workspace_deleted")

// Project External Events
data class ProjectCreatedExternalEvent(
    override val eventId: String,
    val projectId: String,
    val title: String,
    val description: String,
    val workspaceId: String,
    val ownerId: String,
    val status: String
) : ExternalEvent(eventId, "project_created")

data class ProjectStatusChangedExternalEvent(
    override val eventId: String,
    val projectId: String,
    val workspaceId: String,
    val oldStatus: String,
    val newStatus: String,
    val changedBy: String
) : ExternalEvent(eventId, "project_status_changed")

data class ProjectOwnerChangedExternalEvent(
    override val eventId: String,
    val projectId: String,
    val workspaceId: String,
    val previousOwnerId: String,
    val newOwnerId: String,
    val changedBy: String
) : ExternalEvent(eventId, "project_owner_changed")

data class ProjectArchivedExternalEvent(
    override val eventId: String,
    val projectId: String,
    val workspaceId: String,
    val archivedBy: String
) : ExternalEvent(eventId, "project_archived")

data class ProjectDeletedExternalEvent(
    override val eventId: String,
    val projectId: String,
    val workspaceId: String,
    val deletedBy: String
) : ExternalEvent(eventId, "project_deleted")

// Task External Events
data class TaskCreatedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val title: String,
    val description: String,
    val workspaceId: String,
    val projectId: String,
    val createdBy: String,
    val priority: String,
    val deadline: Instant?,
    val tags: List<String>,
    val categories: List<String>
) : ExternalEvent(eventId, "task_created")

data class TaskAssignedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val assignedTo: String,
    val assignedBy: String,
    val previousAssignee: String?
) : ExternalEvent(eventId, "task_assigned")

data class TaskUnassignedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val previousAssignee: String,
    val unassignedBy: String
) : ExternalEvent(eventId, "task_unassigned")

data class TaskStatusChangedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val oldStatus: String,
    val newStatus: String,
    val changedBy: String,
    val assignedTo: String?
) : ExternalEvent(eventId, "task_status_changed")

data class TaskCompletedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val completedBy: String,
    val assignedTo: String?,
    val completionTime: Instant,
    val durationInMinutes: Long?
) : ExternalEvent(eventId, "task_completed")

data class TaskPriorityChangedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val oldPriority: String,
    val newPriority: String,
    val changedBy: String
) : ExternalEvent(eventId, "task_priority_changed")

data class TaskDeadlineUpdatedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val oldDeadline: Instant?,
    val newDeadline: Instant?,
    val updatedBy: String
) : ExternalEvent(eventId, "task_deadline_updated")

data class TaskOverdueExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val assignedTo: String?,
    val deadline: Instant,
    val daysOverdue: Long
) : ExternalEvent(eventId, "task_overdue")

data class TaskDeletedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val deletedBy: String
) : ExternalEvent(eventId, "task_deleted")

// Task Collaboration Events
data class TaskCommentAddedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val commentId: String,
    val authorId: String,
    val content: String,
    val assignedTo: String?
) : ExternalEvent(eventId, "task_comment_added")

data class TaskFileAttachedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val fileId: String,
    val fileName: String,
    val fileType: String,
    val fileSize: Long,
    val uploadedBy: String
) : ExternalEvent(eventId, "task_file_attached")

// Notification Events
data class TaskDueSoonExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val assignedTo: String?,
    val deadline: Instant,
    val hoursUntilDue: Long
) : ExternalEvent(eventId, "task_due_soon")

data class ProjectMilestoneReachedExternalEvent(
    override val eventId: String,
    val projectId: String,
    val workspaceId: String,
    val milestoneType: String, // e.g., "50_percent_complete", "all_tasks_completed"
    val completedTasks: Int,
    val totalTasks: Int,
    val completionPercentage: Double
) : ExternalEvent(eventId, "project_milestone_reached")

// Analytics Events
data class UserProductivityMetricsExternalEvent(
    override val eventId: String,
    val userId: String,
    val workspaceId: String,
    val period: String, // "daily", "weekly", "monthly"
    val tasksCompleted: Int,
    val tasksCreated: Int,
    val averageCompletionTime: Double,
    val productivityScore: Double
) : ExternalEvent(eventId, "user_productivity_metrics")

data class WorkspaceActivitySummaryExternalEvent(
    override val eventId: String,
    val workspaceId: String,
    val period: String,
    val totalTasks: Int,
    val completedTasks: Int,
    val overdueTasks: Int,
    val activeMemberCount: Int,
    val averageTaskCompletionTime: Double
) : ExternalEvent(eventId, "workspace_activity_summary")

// Integration Events
data class ExternalSystemSyncRequestedExternalEvent(
    override val eventId: String,
    val targetSystem: String, // e.g., "jira", "github", "slack"
    val entityType: String, // "task", "project", "workspace"
    val entityId: String,
    val syncType: String, // "create", "update", "delete"
    val requestedBy: String
) : ExternalEvent(eventId, "external_system_sync_requested")

data class CalendarEventCreatedExternalEvent(
    override val eventId: String,
    val taskId: String,
    val workspaceId: String,
    val projectId: String,
    val eventTitle: String,
    val startTime: Instant,
    val endTime: Instant,
    val attendees: List<String>
) : ExternalEvent(eventId, "calendar_event_created")