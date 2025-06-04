package mk.ukim.finki.soa.backend.model

import org.axonframework.commandhandling.CommandHandler
import org.axonframework.eventsourcing.EventSourcingHandler
import org.axonframework.modelling.command.AggregateIdentifier
import org.axonframework.modelling.command.AggregateLifecycle
import org.axonframework.spring.stereotype.Aggregate
import java.util.UUID

@Aggregate
class Task {

    @AggregateIdentifier
    private lateinit var id: TaskId
    private lateinit var title: TaskTitle
    private lateinit var description: TaskDescription
    private lateinit var workspaceId: WorkspaceId
    private lateinit var projectId: ProjectId
    private var assignedUserId: String? = null
    private var status: TaskStatus = TaskStatus.PENDING
    private var priority: TaskPriority = TaskPriority.MEDIUM
    private var deadline: Deadline? = null
    private var recurrenceRule: RecurrenceRule? = null
    private val tags: MutableList<Tag> = mutableListOf()
    private val categories: MutableList<Category> = mutableListOf()
    private val attachments: MutableMap<String, Map<String, Any>> = mutableMapOf()
    private val comments: MutableMap<String, Map<String, Any>> = mutableMapOf()

    constructor()

    @CommandHandler
    constructor(command: CreateTaskCommand) {
        val event = TaskCreatedEvent(
            taskId = command.taskId,
            title = command.title,
            description = command.description,
            workspaceId = command.workspaceId,
            projectId = command.projectId,
            priority = command.priority,
            deadline = command.deadline,
            recurrenceRule = command.recurrenceRule,
            tags = command.tags,
            categories = command.categories
        )
        AggregateLifecycle.apply(event)
    }

    @CommandHandler
    fun handle(command: AssignTaskCommand) {
        AggregateLifecycle.apply(TaskAssignedEvent(command.taskId, command.assignedUserId))
    }

    @CommandHandler
    fun handle(command: RemoveTaskAssigneeCommand) {
        if (assignedUserId == null) {
            throw IllegalStateException("Task is not assigned to anyone")
        }
        AggregateLifecycle.apply(TaskAssigneeRemovedEvent(command.taskId))
    }

    @CommandHandler
    fun handle(command: CompleteTaskCommand) {
        if (status == TaskStatus.COMPLETED) {
            throw IllegalStateException("Task is already completed")
        }
        AggregateLifecycle.apply(TaskCompletedEvent(command.taskId))
    }

    @CommandHandler
    fun handle(command: UpdateTaskTitleCommand) {
        AggregateLifecycle.apply(TaskTitleUpdatedEvent(command.taskId, command.title))
    }

    @CommandHandler
    fun handle(command: UpdateTaskDescriptionCommand) {
        AggregateLifecycle.apply(TaskDescriptionUpdatedEvent(command.taskId, command.description))
    }

    @CommandHandler
    fun handle(command: SetTaskDeadlineCommand) {
        AggregateLifecycle.apply(TaskDeadlineSetEvent(command.taskId, command.deadline))
    }

    @CommandHandler
    fun handle(command: ChangeTaskPriorityCommand) {
        AggregateLifecycle.apply(TaskPriorityChangedEvent(command.taskId, command.priority))
    }

    @CommandHandler
    fun handle(command: UpdateTaskStatusCommand) {
        AggregateLifecycle.apply(TaskStatusUpdatedEvent(command.taskId, command.status))
    }

    @CommandHandler
    fun handle(command: SetupRecurringTaskCommand) {
        AggregateLifecycle.apply(RecurringTaskSetupEvent(command.taskId, command.recurrenceRule))
    }

    @CommandHandler
    fun handle(command: AttachFileCommand) {
        AggregateLifecycle.apply(
            FileAttachedEvent(
                taskId = command.taskId,
                fileId = command.fileId,
                fileName = command.fileName,
                fileType = command.fileType,
                fileSize = command.fileSize
            )
        )
    }

    @CommandHandler
    fun handle(command: RemoveFileCommand) {
        if (!attachments.containsKey(command.fileId)) {
            throw IllegalArgumentException("File does not exist")
        }
        AggregateLifecycle.apply(FileRemovedEvent(command.taskId, command.fileId))
    }

    @CommandHandler
    fun handle(command: AddCommentCommand) {
        val commentId = command.commentId.ifEmpty { UUID.randomUUID().toString() }
        AggregateLifecycle.apply(
            CommentAddedEvent(
                taskId = command.taskId,
                commentId = commentId,
                authorId = command.authorId,
                content = command.content
            )
        )
    }

    @CommandHandler
    fun handle(command: UpdateCommentCommand) {
        if (!comments.containsKey(command.commentId)) {
            throw IllegalArgumentException("Comment does not exist")
        }

        val comment = comments[command.commentId] ?: throw IllegalStateException("Comment not found")
        val authorId = comment["authorId"] as String

        AggregateLifecycle.apply(
            CommentUpdatedEvent(
                taskId = command.taskId,
                commentId = command.commentId,
                content = command.content
            )
        )
    }

    @CommandHandler
    fun handle(command: DeleteCommentCommand) {
        if (!comments.containsKey(command.commentId)) {
            throw IllegalArgumentException("Comment does not exist")
        }
        AggregateLifecycle.apply(CommentDeletedEvent(command.taskId, command.commentId))
    }

    @CommandHandler
    fun handle(command: DeleteTaskCommand) {
        AggregateLifecycle.apply(TaskDeletedEvent(command.taskId))
    }

    @EventSourcingHandler
    fun on(event: TaskCreatedEvent) {
        id = event.taskId
        title = event.title
        description = event.description
        workspaceId = event.workspaceId
        projectId = event.projectId
        priority = event.priority
        deadline = event.deadline
        recurrenceRule = event.recurrenceRule
        tags.addAll(event.tags)
        categories.addAll(event.categories)
    }

    @EventSourcingHandler
    fun on(event: TaskAssignedEvent) {
        assignedUserId = event.assignedUserId
    }

    @EventSourcingHandler
    fun on(event: TaskAssigneeRemovedEvent) {
        assignedUserId = null
    }

    @EventSourcingHandler
    fun on(event: TaskCompletedEvent) {
        status = TaskStatus.COMPLETED
    }

    @EventSourcingHandler
    fun on(event: TaskTitleUpdatedEvent) {
        title = event.title
    }

    @EventSourcingHandler
    fun on(event: TaskDescriptionUpdatedEvent) {
        description = event.description
    }

    @EventSourcingHandler
    fun on(event: TaskDeadlineSetEvent) {
        deadline = event.deadline
    }

    @EventSourcingHandler
    fun on(event: TaskPriorityChangedEvent) {
        priority = event.priority
    }

    @EventSourcingHandler
    fun on(event: TaskStatusUpdatedEvent) {
        status = event.status
    }

    @EventSourcingHandler
    fun on(event: RecurringTaskSetupEvent) {
        recurrenceRule = event.recurrenceRule
    }

    @EventSourcingHandler
    fun on(event: FileAttachedEvent) {
        attachments[event.fileId] = mapOf(
            "fileName" to event.fileName,
            "fileType" to event.fileType,
            "fileSize" to event.fileSize
        )
    }

    @EventSourcingHandler
    fun on(event: FileRemovedEvent) {
        attachments.remove(event.fileId)
    }

    @EventSourcingHandler
    fun on(event: CommentAddedEvent) {
        comments[event.commentId] = mapOf(
            "authorId" to event.authorId,
            "content" to event.content,
            "timestamp" to event.timestamp
        )
    }

    @EventSourcingHandler
    fun on(event: CommentUpdatedEvent) {
        val comment = comments[event.commentId]?.toMutableMap() ?: return
        comment["content"] = event.content
        comments[event.commentId] = comment
    }

    @EventSourcingHandler
    fun on(event: CommentDeletedEvent) {
        comments.remove(event.commentId)
    }
}
