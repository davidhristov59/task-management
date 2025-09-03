package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.model.*
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.messaging.responsetypes.ResponseTypes
import org.axonframework.queryhandling.QueryGateway
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*
import java.util.concurrent.CompletableFuture

@RestController
@RequestMapping("/workspaces/{workspaceId}/projects/{projectId}/tasks")
class TaskRestApi(
    private val commandGateway: CommandGateway,
    private val queryGateway: QueryGateway
) {

    @GetMapping
    fun getTasks(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @RequestParam(required = false) status: TaskStatus?,
        @RequestParam(required = false) priority: TaskPriority?,
        @RequestParam(required = false) assignedUserId: String?
    ): CompletableFuture<List<TaskView>> {
        return queryGateway.query(
            "findTasksByProjectId",
            FindTasksQuery(
                projectId = ProjectId(projectId),
                status = status,
                priority = priority,
                assignedUserId = assignedUserId
            ),
            ResponseTypes.multipleInstancesOf(TaskView::class.java)
        )
    }

    @GetMapping("/{taskId}")
    fun getTask(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String
    ): CompletableFuture<ResponseEntity<TaskView>> {
        return queryGateway.query(
            "findTaskById",
            TaskId(taskId),
            ResponseTypes.instanceOf(TaskView::class.java)
        )
            .thenApply { ResponseEntity.ok(it) }
            .exceptionally { ResponseEntity.notFound().build() }
    }

    @PostMapping
    fun createTask(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @RequestBody request: CreateTaskRequest
    ): CompletableFuture<ResponseEntity<TaskId>> {
        val taskId = TaskId(UUID.randomUUID().toString())

        val command = CreateTaskCommand(
            taskId = taskId,
            title = TaskTitle(request.title),
            description = TaskDescription(request.description ?: ""),
            workspaceId = WorkspaceId(workspaceId),
            projectId = ProjectId(projectId),
            priority = request.priority ?: TaskPriority.MEDIUM,
            deadline = request.deadlineDate?.let { Deadline(it) },
            recurrenceRule = request.recurrence?.let {
                RecurrenceRule(
                    type = it.type,
                    interval = it.interval,
                    endDate = it.endDate
                )
            },
            tags = request.tags?.map { Tag(UUID.randomUUID().toString(), it) } ?: emptyList(),
            categories = request.categories?.map { Category(UUID.randomUUID().toString(), it) } ?: emptyList()
        )

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.status(HttpStatus.CREATED).body(taskId) }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PutMapping("/{taskId}")
    fun updateTask(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String,
        @RequestBody request: UpdateTaskRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        val futures = mutableListOf<CompletableFuture<Any>>()

        request.title?.let {
            futures.add(commandGateway.send<Any>(UpdateTaskTitleCommand(TaskId(taskId), TaskTitle(it))))
        }

        request.description?.let {
            futures.add(commandGateway.send<Any>(UpdateTaskDescriptionCommand(TaskId(taskId), TaskDescription(it))))
        }

        request.status?.let {
            futures.add(commandGateway.send<Any>(UpdateTaskStatusCommand(TaskId(taskId), it)))
        }

        request.priority?.let {
            futures.add(commandGateway.send<Any>(ChangeTaskPriorityCommand(TaskId(taskId), it)))
        }

        request.deadline?.let {
            futures.add(commandGateway.send<Any>(SetTaskDeadlineCommand(TaskId(taskId), Deadline(it))))
        }

        if (futures.isEmpty()) {
            return CompletableFuture.completedFuture(ResponseEntity.ok().build())
        }

        return CompletableFuture.allOf(*futures.toTypedArray())
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PostMapping("/{taskId}/assign")
    fun assignTask(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String,
        @RequestBody userId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Any>(AssignTaskCommand(TaskId(taskId), userId))
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @DeleteMapping("/{taskId}/assign")
    fun unassignTask(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Any>(RemoveTaskAssigneeCommand(TaskId(taskId)))
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PostMapping("/{taskId}/complete")
    fun completeTask(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Any>(CompleteTaskCommand(TaskId(taskId)))
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PostMapping("/{taskId}/recurring")
    fun setupRecurringTask(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String,
        @RequestBody request: RecurrenceRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        val recurrenceRule = RecurrenceRule(
            type = request.type,
            interval = request.interval,
            endDate = request.endDate
        )

        return commandGateway.send<Any>(SetupRecurringTaskCommand(TaskId(taskId), recurrenceRule))
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PostMapping("/{taskId}/comments")
    fun addComment(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String,
        @RequestBody request: CommentRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        val commentId = UUID.randomUUID().toString()

        return commandGateway.send<Any>(AddCommentCommand(
            taskId = TaskId(taskId),
            commentId = commentId,
            authorId = request.authorId,
            content = request.content
        ))
            .thenApply { ResponseEntity.status(HttpStatus.CREATED).build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PutMapping("/{taskId}/comments/{commentId}")
    fun updateComment(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String,
        @PathVariable commentId: String,
        @RequestBody request: CommentRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Any>(UpdateCommentCommand(
            taskId = TaskId(taskId),
            commentId = commentId,
            content = request.content
        ))
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @DeleteMapping("/{taskId}/comments/{commentId}")
    fun deleteComment(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String,
        @PathVariable commentId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Any>(DeleteCommentCommand(TaskId(taskId), commentId))
            .thenApply { ResponseEntity.noContent().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PostMapping("/{taskId}/attachments")
    fun attachFile(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String,
        @RequestBody request: AttachmentRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        val fileId = UUID.randomUUID().toString()

        return commandGateway.send<Any>(AttachFileCommand(
            taskId = TaskId(taskId),
            fileId = fileId,
            fileName = request.fileName,
            fileType = request.fileType,
            fileSize = request.fileSize
        ))
            .thenApply { ResponseEntity.status(HttpStatus.CREATED).build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @DeleteMapping("/{taskId}/attachments/{fileId}")
    fun removeFile(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String,
        @PathVariable fileId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Any>(RemoveFileCommand(TaskId(taskId), fileId))
            .thenApply { ResponseEntity.noContent().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @DeleteMapping("/{taskId}")
    fun deleteTask(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @PathVariable taskId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Any>(DeleteTaskCommand(TaskId(taskId)))
            .thenApply { ResponseEntity.noContent().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }
}

