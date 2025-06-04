package mk.ukim.finki.soa.backend.model

import java.time.LocalDateTime

data class FindTasksQuery(
    val projectId: ProjectId,
    val status: TaskStatus? = null,
    val priority: TaskPriority? = null,
    val assignedUserId: String? = null
)

data class CreateTaskRequest(
    val title: String,
    val description: String? = null,
    val priority: TaskPriority? = null,
    val deadlineDate: LocalDateTime? = null,
    val recurrence: RecurrenceRequest? = null,
    val tags: List<String>? = null,
    val categories: List<String>? = null
)

data class UpdateTaskRequest(
    val title: String? = null,
    val description: String? = null,
    val status: TaskStatus? = null,
    val priority: TaskPriority? = null,
    val deadline: LocalDateTime? = null
)

data class RecurrenceRequest(
    val type: RecurrenceType,
    val interval: Int,
    val endDate: LocalDateTime? = null
)

data class CommentRequest(
    val authorId: String,
    val content: String
)

data class AttachmentRequest(
    val fileName: String,
    val fileType: String,
    val fileSize: Long
)
