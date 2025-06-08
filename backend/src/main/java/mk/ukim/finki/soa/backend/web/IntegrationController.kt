import mk.ukim.finki.soa.backend.client.*
import mk.ukim.finki.soa.backend.dto.*
import mk.ukim.finki.soa.backend.service.EventMessagingService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/integration")
class IntegrationController(
        private val messagingService: EventMessagingService,
        private val userServiceClient: UserServiceClient,
        private val notificationServiceClient: NotificationServiceClient,
        private val projectServiceClient: ProjectServiceClient
) {

    // Тестирање на Feign клиенти
    @GetMapping("/users/{userId}")
    fun getUser(@PathVariable userId: String): UserDto {
        return userServiceClient.getUserById(userId)
    }

    @GetMapping("/users")
    fun getAllUsers(): List<UserDto> {
        return userServiceClient.getAllUsers()
    }

    @PostMapping("/notifications/send")
    fun sendNotification(@RequestBody notification: NotificationRequest): NotificationResponse {
        return notificationServiceClient.sendNotification(notification)
    }

    @GetMapping("/projects/{projectId}")
    fun getProject(@PathVariable projectId: String): ProjectDto {
        return projectServiceClient.getProject(projectId)
    }

    // Тестирање на Kafka publishing
    @PostMapping("/events/test-task-created")
    fun publishTestTaskCreatedEvent(@RequestParam taskId: String, @RequestParam title: String) {
        val event = mapOf(
                "eventType" to "TaskCreated",
                "taskId" to taskId,
                "taskTitle" to title,
                "assignedTo" to "user123",
                "timestamp" to System.currentTimeMillis(),
                "source" to "task-management-service"
        )

        messagingService.send("task-management.task-events", taskId,
                com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(event))
    }

    @PostMapping("/events/test-external-call")
    fun testExternalServiceCall(@RequestParam userId: String) {
        val notification = NotificationRequest(
                recipientId = userId,
                title = "Test Notification",
                message = "This is a test notification from task management service"
        )

        val response = userServiceClient.sendNotificationToUser(userId, notification)
        println("Response from external service: $response")
    }
}