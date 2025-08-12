package mk.ukim.finki.soa.backend.model

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import mk.ukim.finki.soa.backend.repository.TaskViewRepository
import org.axonframework.eventhandling.EventHandler
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.function.Consumer

@Component
class TaskEventHandler(
    private val repository: TaskViewRepository,
    private val objectMapper: ObjectMapper
) {

    @EventHandler
    fun on(event: TaskCreatedEvent) {
        val task = TaskView(
            taskId = event.taskId,
            title = event.title.toString(),
            description = event.description.toString(),
            workspaceId = event.workspaceId,
            projectId = event.projectId,
            status = TaskStatus.PENDING,
            priority = event.priority,
            deadline = event.deadline?.date,
            createdAt = event.timestamp,
            lastModifiedAt = event.timestamp,
            tags = objectMapper.writeValueAsString(event.tags),
            categories = objectMapper.writeValueAsString(event.categories)
        )
        repository.save(task)
    }

    @EventHandler
    fun on(event: TaskAssignedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            task.assignedUserId = event.assignedUserId
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: TaskAssigneeRemovedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            task.assignedUserId = null
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: TaskCompletedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            task.status = TaskStatus.COMPLETED
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: TaskTitleUpdatedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            task.title = event.title.toString()
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: TaskDescriptionUpdatedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            task.description = event.description.toString()
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: TaskDeadlineSetEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            task.deadline = event.deadline.date
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: TaskPriorityChangedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            task.priority = event.priority
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: TaskStatusUpdatedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            task.status = event.status
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: FileAttachedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            val attachmentsType = object : TypeReference<List<Map<String, Any>>>() {}
            val attachments = if (task.attachments == "[]") {
                mutableListOf<Map<String, Any>>()
            } else {
                objectMapper.readValue(task.attachments, attachmentsType).toMutableList()
            }

            attachments.add(
                mapOf(
                    "fileId" to event.fileId,
                    "fileName" to event.fileName,
                    "fileType" to event.fileType,
                    "fileSize" to event.fileSize
                )
            )
            task.attachments = objectMapper.writeValueAsString(attachments)
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: FileRemovedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            val attachmentsType = object : TypeReference<List<Map<String, Any>>>() {}
            val attachments = if (task.attachments == "[]") {
                emptyList<Map<String, Any>>()
            } else {
                objectMapper.readValue(task.attachments, attachmentsType)
                    .filter { map -> map["fileId"] != event.fileId }
            }
            task.attachments = objectMapper.writeValueAsString(attachments)
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: CommentAddedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            val commentsType = object : TypeReference<List<Map<String, Any>>>() {}
            val comments = if (task.comments == "[]") {
                mutableListOf<Map<String, Any>>()
            } else {
                objectMapper.readValue(task.comments, commentsType).toMutableList()
            }

            comments.add(
                mapOf(
                    "commentId" to event.commentId,
                    "authorId" to event.authorId,
                    "content" to event.content,
                    "timestamp" to event.timestamp.toString()
                )
            )
            task.comments = objectMapper.writeValueAsString(comments)
            task.lastModifiedAt = event.timestamp
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: CommentUpdatedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            val commentsType = object : TypeReference<List<Map<String, Any>>>() {}
            val comments = if (task.comments == "[]") {
                mutableListOf<Map<String, Any>>()
            } else {
                objectMapper.readValue(task.comments, commentsType).toMutableList()
            }

            val index = comments.indexOfFirst { map -> map["commentId"] == event.commentId }
            if (index >= 0) {
                val comment = comments[index].toMutableMap()
                comment["content"] = event.content
                comments[index] = comment
                task.comments = objectMapper.writeValueAsString(comments)
                task.lastModifiedAt = Instant.now()
                repository.save(task)
            }
        })
    }

    @EventHandler
    fun on(event: CommentDeletedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            val commentsType = object : TypeReference<List<Map<String, Any>>>() {}
            val comments = if (task.comments == "[]") {
                emptyList<Map<String, Any>>()
            } else {
                objectMapper.readValue(task.comments, commentsType)
                    .filter { map -> map["commentId"] != event.commentId }
            }

            task.comments = objectMapper.writeValueAsString(comments)
            task.lastModifiedAt = Instant.now()
            repository.save(task)
        })
    }

    @EventHandler
    fun on(event: TaskDeletedEvent) {
        repository.findById(event.taskId).ifPresent(Consumer<TaskView> { task ->
            task.deleted = true
            task.lastModifiedAt = Instant.now()
            repository.save(task)
        })
    }
}
