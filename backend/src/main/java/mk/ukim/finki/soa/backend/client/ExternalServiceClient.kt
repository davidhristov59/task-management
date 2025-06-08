package mk.ukim.finki.soa.backend.client

import mk.ukim.finki.soa.backend.dto.*
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.*


@FeignClient(
    name = "user-management-service",
    fallback = UserServiceFallback::class
)
interface UserServiceClient {

    @GetMapping("/api/users/{userId}")
    fun getUserById(@PathVariable userId: String): UserDto

    @GetMapping("/api/users")
    fun getAllUsers(): List<UserDto>

    @PostMapping("/api/users/{userId}/notifications")
    fun sendNotificationToUser(@PathVariable userId: String, @RequestBody notification: NotificationRequest): String
}

// Клиент за Notification сервис
@FeignClient(
    name = "notification-service",
    fallback = NotificationServiceFallback::class
)
interface NotificationServiceClient {

    @PostMapping("/api/notifications/send")
    fun sendNotification(@RequestBody notification: NotificationRequest): NotificationResponse

    @GetMapping("/api/notifications/user/{userId}")
    fun getUserNotifications(@PathVariable userId: String): List<NotificationDto>
}

// Клиент за Project Management сервис
@FeignClient(
    name = "project-management-service",
    fallback = ProjectServiceFallback::class
)
interface ProjectServiceClient {

    @GetMapping("/api/projects/{projectId}")
    fun getProject(@PathVariable projectId: String): ProjectDto

    @PostMapping("/api/projects/{projectId}/tasks")
    fun addTaskToProject(@PathVariable projectId: String, @RequestBody task: TaskDto): String

    @PutMapping("/api/projects/{projectId}/status")
    fun updateProjectStatus(@PathVariable projectId: String, @RequestParam status: String): String
}