package mk.ukim.finki.soa.backend.messaging.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import mk.ukim.finki.soa.backend.model.*
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
                    val userEmail = event["userEmail"] as? String ?: ""
                    val userRole = event["userRole"] as? String ?: "STUDENT"
                    
                    val userCreatedEvent = UserCreatedEvent(
                        userId = UserId(userId),
                        name = UserName(userName),
                        email = UserEmail(userEmail),
                        role = UserRole.valueOf(userRole)
                    )
                    taskIntegrationService.handleUserCreated(userCreatedEvent)
                }
                "UserDeactivated" -> {
                    val userId = event["userId"] as String
                    val userDeactivatedEvent = UserDeactivatedEvent(
                        userId = UserId(userId)
                    )
                    taskIntegrationService.handleUserDeactivated(userDeactivatedEvent)
                }
                "UserNameUpdated" -> {
                    val userId = event["userId"] as String
                    val userName = event["userName"] as String
                    val userNameUpdatedEvent = UserNameUpdatedEvent(
                        userId = UserId(userId),
                        name = UserName(userName)
                    )
                    taskIntegrationService.handleUserNameUpdated(userNameUpdatedEvent)
                }
                "UserEmailUpdated" -> {
                    val userId = event["userId"] as String
                    val userEmail = event["userEmail"] as String
                    val userEmailUpdatedEvent = UserEmailUpdatedEvent(
                        userId = UserId(userId),
                        email = UserEmail(userEmail)
                    )
                    taskIntegrationService.handleUserEmailUpdated(userEmailUpdatedEvent)
                }
                "UserRoleChanged" -> {
                    val userId = event["userId"] as String
                    val oldRole = event["oldRole"] as String
                    val newRole = event["newRole"] as String
                    val userRoleChangedEvent = UserRoleChangedEvent(
                        userId = UserId(userId),
                        old_role = UserRole.valueOf(oldRole),
                        new_role = UserRole.valueOf(newRole)
                    )
                    taskIntegrationService.handleUserRoleChanged(userRoleChangedEvent)
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
                    val projectTitle = event["projectTitle"] as String
                    val projectDescription = event["projectDescription"] as? String ?: ""
                    val workspaceId = event["workspaceId"] as String
                    val ownerId = event["ownerId"] as String
                    val status = event["status"] as? String ?: "PLANNING"
                    
                    val projectCreatedEvent = ProjectCreatedEvent(
                        projectId = ProjectId(projectId),
                        title = ProjectTitle(projectTitle),
                        description = ProjectDescription(projectDescription),
                        workspaceId = WorkspaceId(workspaceId),
                        ownerId = ownerId,
                        status = ProjectStatus.valueOf(status)
                    )
                    taskIntegrationService.handleProjectCreated(projectCreatedEvent)
                }
                "ProjectStatusUpdated" -> {
                    val projectId = event["projectId"] as String
                    val newStatus = event["status"] as String
                    val projectStatusUpdatedEvent = ProjectStatusUpdatedEvent(
                        projectId = ProjectId(projectId),
                        status = ProjectStatus.valueOf(newStatus)
                    )
                    taskIntegrationService.handleProjectStatusUpdated(projectStatusUpdatedEvent)
                }
                "ProjectDeleted" -> {
                    val projectId = event["projectId"] as String
                    val projectDeletedEvent = ProjectDeletedEvent(
                        projectId = ProjectId(projectId)
                    )
                    taskIntegrationService.handleProjectDeleted(projectDeletedEvent)
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