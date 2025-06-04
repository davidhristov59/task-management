package mk.ukim.finki.soa.backend.model

import org.axonframework.modelling.command.TargetAggregateIdentifier
import java.time.LocalDateTime

abstract class TaskCommand(
    @TargetAggregateIdentifier open val taskId: TaskId
)

data class CreateTaskCommand(
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
) : TaskCommand(taskId)

data class AssignTaskCommand(
    override val taskId: TaskId,
    val assignedUserId: String
) : TaskCommand(taskId)

data class RemoveTaskAssigneeCommand(
    override val taskId: TaskId
) : TaskCommand(taskId)

data class CompleteTaskCommand(
    override val taskId: TaskId
) : TaskCommand(taskId)

data class UpdateTaskTitleCommand(
    override val taskId: TaskId,
    val title: TaskTitle
) : TaskCommand(taskId)

data class UpdateTaskDescriptionCommand(
    override val taskId: TaskId,
    val description: TaskDescription
) : TaskCommand(taskId)

data class SetTaskDeadlineCommand(
    override val taskId: TaskId,
    val deadline: Deadline
) : TaskCommand(taskId)

data class ChangeTaskPriorityCommand(
    override val taskId: TaskId,
    val priority: TaskPriority
) : TaskCommand(taskId)

data class UpdateTaskStatusCommand(
    override val taskId: TaskId,
    val status: TaskStatus
) : TaskCommand(taskId)

data class SetupRecurringTaskCommand(
    override val taskId: TaskId,
    val recurrenceRule: RecurrenceRule
) : TaskCommand(taskId)

data class AttachFileCommand(
    override val taskId: TaskId,
    val fileId: String,
    val fileName: String,
    val fileType: String,
    val fileSize: Long
) : TaskCommand(taskId)

data class RemoveFileCommand(
    override val taskId: TaskId,
    val fileId: String
) : TaskCommand(taskId)

data class AddCommentCommand(
    override val taskId: TaskId,
    val commentId: String,
    val authorId: String,
    val content: String
) : TaskCommand(taskId)

data class UpdateCommentCommand(
    override val taskId: TaskId,
    val commentId: String,
    val content: String
) : TaskCommand(taskId)

data class DeleteCommentCommand(
    override val taskId: TaskId,
    val commentId: String
) : TaskCommand(taskId)

data class DeleteTaskCommand(
    override val taskId: TaskId
) : TaskCommand(taskId)
