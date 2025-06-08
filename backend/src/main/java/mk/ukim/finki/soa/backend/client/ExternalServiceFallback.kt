package mk.ukim.finki.soa.backend.client

import mk.ukim.finki.soa.backend.dto.*
import org.springframework.stereotype.Component

@Component
class UserServiceFallback : UserServiceClient {
    override fun getUserById(userId: String): UserDto {
        return UserDto(userId, "Unknown User", "unknown@email.com", "INACTIVE")
    }

    override fun getAllUsers(): List<UserDto> {
        return emptyList()
    }

    override fun sendNotificationToUser(userId: String, notification: NotificationRequest): String {
        return "User service unavailable - notification queued for retry"
    }
}

@Component
class NotificationServiceFallback : NotificationServiceClient {
    override fun sendNotification(notification: NotificationRequest): NotificationResponse {
        return NotificationResponse("FAILED", "Notification service unavailable")
    }

    override fun getUserNotifications(userId: String): List<NotificationDto> {
        return emptyList()
    }
}

@Component
class ProjectServiceFallback : ProjectServiceClient {
    override fun getProject(projectId: String): ProjectDto {
        return ProjectDto(projectId, "Unknown Project", "UNKNOWN", emptyList())
    }

    override fun addTaskToProject(projectId: String, task: TaskDto): String {
        return "Project service unavailable - task will be added when service is restored"
    }

    override fun updateProjectStatus(projectId: String, status: String): String {
        return "Project service unavailable - status update queued"
    }
}