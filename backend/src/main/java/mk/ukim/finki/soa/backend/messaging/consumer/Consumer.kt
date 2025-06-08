package mk.ukim.finki.soa.backend.messaging.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import mk.ukim.finki.soa.backend.service.TaskIntegrationService
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.KafkaHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.stereotype.Component

@Component
class ExternalEventSubscriber(
    private val objectMapper: ObjectMapper,
    private val taskIntegrationService: TaskIntegrationService
) {

    // Слушање на user events од User Management сервис
    @KafkaListener(
        topics = ["user-management.user-events"],
        groupId = "task-management-consumer-group"
    )
    fun handleUserEvents(
        @Payload message: String,
        @Header(KafkaHeaders.RECEIVED_TOPIC) topic: String,
        @Header(KafkaHeaders.RECEIVED_PARTITION) partition: Int
    ) {
        try {
            val event = objectMapper.readValue(message, Map::class.java)
            println("Received user event from topic: $topic, partition: $partition")

            when (event["eventType"] as String) {
                "UserCreated" -> {
                    val userId = event["userId"] as String
                    val userName = event["userName"] as String
                    taskIntegrationService.handleUserCreated(userId, userName)
                }
                "UserDeactivated" -> {
                    val userId = event["userId"] as String
                    taskIntegrationService.handleUserDeactivated(userId)
                }
                "UserUpdated" -> {
                    val userId = event["userId"] as String
                    val userData = event["userData"] as Map<String, Any>
                    taskIntegrationService.handleUserUpdated(userId, userData)
                }
            }
        } catch (e: Exception) {
            println("Error processing user event: ${e.message}")
        }
    }

    // Слушање на project events од Project Management сервис
    @KafkaListener(
        topics = ["project-management.project-events"],
        groupId = "task-management-consumer-group"
    )
    fun handleProjectEvents(
        @Payload message: String,
        @Header(KafkaHeaders.RECEIVED_TOPIC) topic: String
    ) {
        try {
            val event = objectMapper.readValue(message, Map::class.java)
            println("Received project event from topic: $topic")

            when (event["eventType"] as String) {
                "ProjectCreated" -> {
                    val projectId = event["projectId"] as String
                    val projectName = event["projectName"] as String
                    taskIntegrationService.handleProjectCreated(projectId, projectName)
                }
                "ProjectStatusChanged" -> {
                    val projectId = event["projectId"] as String
                    val newStatus = event["newStatus"] as String
                    taskIntegrationService.handleProjectStatusChanged(projectId, newStatus)
                }
                "ProjectDeleted" -> {
                    val projectId = event["projectId"] as String
                    taskIntegrationService.handleProjectDeleted(projectId)
                }
            }
        } catch (e: Exception) {
            println("Error processing project event: ${e.message}")
        }
    }

    // Слушање на notification events од Notification сервис
    @KafkaListener(
        topics = ["notification-service.notification-events"],
        groupId = "task-management-consumer-group"
    )
    fun handleNotificationEvents(
        @Payload message: String
    ) {
        try {
            val event = objectMapper.readValue(message, Map::class.java)

            when (event["eventType"] as String) {
                "NotificationDelivered" -> {
                    val taskId = event["taskId"] as? String
                    val userId = event["userId"] as String
                    taskIntegrationService.handleNotificationDelivered(taskId, userId)
                }
                "NotificationFailed" -> {
                    val taskId = event["taskId"] as? String
                    val userId = event["userId"] as String
                    val reason = event["reason"] as String
                    taskIntegrationService.handleNotificationFailed(taskId, userId, reason)
                }
            }
        } catch (e: Exception) {
            println("Error processing notification event: ${e.message}")
        }
    }
}