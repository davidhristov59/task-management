package mk.ukim.finki.soa.backend.messaging.publisher

import com.fasterxml.jackson.databind.ObjectMapper
import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.service.EventMessagingService
import org.axonframework.eventhandling.EventHandler
import org.springframework.stereotype.Component
import kotlin.reflect.full.memberProperties

@Component
class ExternalEventPublisher(
    private val messagingService: EventMessagingService,
    private val objectMapper: ObjectMapper
) {
    @EventHandler
    fun <T : Any> on(event: T) {
        val eventType = event::class.java.simpleName.replace("Event", "")
        val eventData = event::class.memberProperties
            .associate { prop -> prop.name to prop.getter.call(event) }
            .filterValues { it != null }

        publishToMainTopic(eventType, extractEventId(event), eventData)
    }

    private fun <T> extractEventId(event: T): String {
        return when (event) {
            is WorkspaceEvent -> event.workspaceId.toString()
            is ProjectEvent -> event.projectId.toString()
            is TaskEvent -> event.taskId.toString()
            else -> "unknown-id"
        }
    }

    private fun publishToMainTopic(eventType: String, key: String, eventData: Map<String, Any?>) {
        publishToTopic("task-management.all-events", key, eventType, eventData)
    }

    private fun publishToTopic(topic: String, key: String, eventType: String, eventData: Map<String, Any?>) {
        val externalEvent = eventData + mapOf(
            "eventType" to eventType,
            "timestamp" to System.currentTimeMillis(),
            "source" to "task-management-service"
        )
        val payload = objectMapper.writeValueAsString(externalEvent)
        messagingService.send(topic, key, payload)
    }
}