package mk.ukim.finki.soa.backend.model.event

data class TaskCreatedEvent(
    val taskId: String,
    val title: String,
    val description: String,
    val assignedTo: String?,
    val projectId: String?,
    val createdBy: String
)

data class TaskCompletedEvent(
    val taskId: String,
    val completedBy: String,
    val completionTime: Long,
    val projectId: String?
)

data class TaskAssignedEvent(
    val taskId: String,
    val assignedTo: String,
    val assignedBy: String,
    val previousAssignee: String?
)

data class TaskStatusChangedEvent(
    val taskId: String,
    val oldStatus: String,
    val newStatus: String,
    val changedBy: String
)