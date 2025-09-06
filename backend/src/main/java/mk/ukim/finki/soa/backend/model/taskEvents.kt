package mk.ukim.finki.soa.backend.model

import java.time.Instant

abstract class TaskEvent(
    open val taskId: TaskId,
    open val timestamp: Instant = Instant.now()
)

data class TaskCreatedEvent(
    override val taskId: TaskId,
    val title: TaskTitle,
    val description: TaskDescription,
    val workspaceId: WorkspaceId,
    val projectId: ProjectId,
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val deadline: Deadline? = null,
    val recurrenceRule: RecurrenceRule? = null,
    val tags: List<Tag> = emptyList(),
    val categories: List<Category> = emptyList()
) : TaskEvent(taskId)

data class TaskAssignedEvent(
    override val taskId: TaskId,
    val assignedUserId: String
) : TaskEvent(taskId)

data class TaskAssigneeRemovedEvent(
    override val taskId: TaskId
) : TaskEvent(taskId)

data class TaskCompletedEvent(
    override val taskId: TaskId
) : TaskEvent(taskId)

data class TaskTitleUpdatedEvent(
    override val taskId: TaskId,
    val title: TaskTitle
) : TaskEvent(taskId)

data class TaskDescriptionUpdatedEvent(
    override val taskId: TaskId,
    val description: TaskDescription
) : TaskEvent(taskId)

data class TaskDeadlineSetEvent(
    override val taskId: TaskId,
    val deadline: Deadline
) : TaskEvent(taskId)

data class TaskPriorityChangedEvent(
    override val taskId: TaskId,
    val priority: TaskPriority
) : TaskEvent(taskId)

data class TaskStatusUpdatedEvent(
    override val taskId: TaskId,
    val status: TaskStatus
) : TaskEvent(taskId)

data class RecurringTaskSetupEvent(
    override val taskId: TaskId,
    val recurrenceRule: RecurrenceRule
) : TaskEvent(taskId)

data class FileAttachedEvent(
    override val taskId: TaskId,
    val fileId: String,
    val fileName: String,
    val fileType: String,
    val fileSize: Long
) : TaskEvent(taskId)

data class FileRemovedEvent(
    override val taskId: TaskId,
    val fileId: String
) : TaskEvent(taskId)

data class CommentAddedEvent(
    override val taskId: TaskId,
    val commentId: String,
    val authorId: String,
    val content: String,
    override val timestamp: Instant = Instant.now()
) : TaskEvent(taskId)

data class CommentUpdatedEvent(
    override val taskId: TaskId,
    val commentId: String,
    val content: String
) : TaskEvent(taskId)

data class CommentDeletedEvent(
    override val taskId: TaskId,
    val commentId: String
) : TaskEvent(taskId)

data class TaskDeletedEvent(
    override val taskId: TaskId
) : TaskEvent(taskId)

data class TagAddedToTaskEvent(
    override val taskId: TaskId,
    val tag: Tag
) : TaskEvent(taskId)

data class TagRemovedFromTaskEvent(
    override val taskId: TaskId,
    val tagId: String
) : TaskEvent(taskId)

data class TaskTagsUpdatedEvent(
    override val taskId: TaskId,
    val tags: List<Tag>
) : TaskEvent(taskId)

data class CategoryAddedToTaskEvent(
    override val taskId: TaskId,
    val category: Category
) : TaskEvent(taskId)

data class CategoryRemovedFromTaskEvent(
    override val taskId: TaskId,
    val categoryId: String
) : TaskEvent(taskId)

data class TaskCategoriesUpdatedEvent(
    override val taskId: TaskId,
    val categories: List<Category>
) : TaskEvent(taskId)