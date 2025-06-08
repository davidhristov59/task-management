package mk.ukim.finki.soa.backend.messaging.publisher

import com.fasterxml.jackson.databind.ObjectMapper
import mk.ukim.finki.soa.backend.model.event.*
import mk.ukim.finki.soa.backend.service.EventMessagingService
import org.axonframework.eventhandling.EventHandler
import org.springframework.stereotype.Component

@Component
class ExternalEventPublisher(
    private val messagingService: EventMessagingService,
    private val objectMapper: ObjectMapper
) {

    // Публикување кога е креирана нова задача
    @EventHandler
    fun on(event: TaskCreatedEvent) {
        val externalEvent = mapOf(
            "eventType" to "TaskCreated",
            "taskId" to event.taskId,
            "taskTitle" to event.title,
            "taskDescription" to event.description,
            "assignedTo" to event.assignedTo,
            "projectId" to event.projectId,
            "createdBy" to event.createdBy,
            "timestamp" to System.currentTimeMillis(),
            "source" to "task-management-service"
        )

        val payload = objectMapper.writeValueAsString(externalEvent)

        // Испраќаме на главен topic за task events
        messagingService.send("task-management.task-events", event.taskId, payload)

        // Ако има assignee, испраќаме и на user-specific topic
        event.assignedTo?.let { userId ->
            messagingService.send("task-management.user-task-events", userId, payload)
        }
    }

    // Публикување кога задачата е завршена
    @EventHandler
    fun on(event: TaskCompletedEvent) {
        val externalEvent = mapOf(
            "eventType" to "TaskCompleted",
            "taskId" to event.taskId,
            "completedBy" to event.completedBy,
            "completionTime" to event.completionTime,
            "projectId" to event.projectId,
            "timestamp" to System.currentTimeMillis(),
            "source" to "task-management-service"
        )

        val payload = objectMapper.writeValueAsString(externalEvent)
        messagingService.send("task-management.task-events", event.taskId, payload)

        // Известување до project management сервис
        messagingService.send("task-management.project-updates", event.projectId ?: "unknown", payload)
    }

    // Публикување кога задачата е доделена
    @EventHandler
    fun on(event: TaskAssignedEvent) {
        val externalEvent = mapOf(
            "eventType" to "TaskAssigned",
            "taskId" to event.taskId,
            "assignedTo" to event.assignedTo,
            "assignedBy" to event.assignedBy,
            "previousAssignee" to event.previousAssignee,
            "timestamp" to System.currentTimeMillis(),
            "source" to "task-management-service"
        )

        val payload = objectMapper.writeValueAsString(externalEvent)
        messagingService.send("task-management.task-events", event.taskId, payload)

        // Специјален topic за assignment notifications
        messagingService.send("task-management.assignment-events", event.assignedTo, payload)
    }

    // Публикување кога се менува статусот на задача
    @EventHandler
    fun on(event: TaskStatusChangedEvent) {
        val externalEvent = mapOf(
            "eventType" to "TaskStatusChanged",
            "taskId" to event.taskId,
            "oldStatus" to event.oldStatus,
            "newStatus" to event.newStatus,
            "changedBy" to event.changedBy,
            "timestamp" to System.currentTimeMillis(),
            "source" to "task-management-service"
        )

        val payload = objectMapper.writeValueAsString(externalEvent)
        messagingService.send("task-management.task-events", event.taskId, payload)
    }
}