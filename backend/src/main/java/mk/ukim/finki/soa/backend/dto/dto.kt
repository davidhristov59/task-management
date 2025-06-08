package mk.ukim.finki.soa.backend.dto

data class UserDto(
        val id: String,
        val name: String,
        val email: String,
        val status: String
)

data class NotificationRequest(
        val recipientId: String,
        val title: String,
        val message: String,
        val type: String = "TASK_UPDATE",
        val priority: String = "NORMAL"
)

data class NotificationResponse(
        val status: String,
        val message: String,
        val notificationId: String? = null
)

data class NotificationDto(
        val id: String,
        val title: String,
        val message: String,
        val type: String,
        val timestamp: Long,
        val read: Boolean = false
)

data class ProjectDto(
        val id: String,
        val name: String,
        val status: String,
        val tasks: List<String>
)

data class TaskDto(
        val id: String,
        val title: String,
        val description: String,
        val status: String,
        val assignedTo: String?,
        val projectId: String?
)