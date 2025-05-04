package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.model.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.concurrent.CompletableFuture
import mk.ukim.finki.soa.backend.service.WorkspaceModificationService
import mk.ukim.finki.soa.backend.service.WorkspaceViewReadService
import org.axonframework.commandhandling.gateway.CommandGateway

@RestController
@RequestMapping("/workspaces")
class WorkspaceRestApi(
    val workspaceViewReadService: WorkspaceViewReadService,
    val workspaceModificationService: WorkspaceModificationService,
    private val commandGateway: CommandGateway
) {

    @GetMapping
    fun findAll(
        @RequestParam(required = false) archived: Boolean?,
        @RequestParam(required = false) ownerId: String?,
        @RequestParam(required = false) memberId: String?
    ): List<WorkspaceView> {
        return workspaceViewReadService.findAllFilter(
            null,
            ownerId,
            memberId,
            archived
        )
    }

    @GetMapping("/{workspaceId}")
    fun findById(@PathVariable workspaceId: String): ResponseEntity<WorkspaceView> {
        try {
            val workspace = workspaceViewReadService.findById(WorkspaceId(workspaceId))
            return ResponseEntity.ok(workspace)
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null)
        }
    }

    @PostMapping
    fun createWorkspace(
        @RequestBody request: CreateWorkspaceRequest
    ): CompletableFuture<ResponseEntity<WorkspaceId>> {
        val workspaceId = WorkspaceId()

        return workspaceModificationService.createWorkspace(
            CreateWorkspaceCommand(
                workspaceId = workspaceId,
                title = WorkspaceTitle(request.title),
                description = request.description,
                ownerId = request.ownerId,
                memberIds = request.memberIds ?: emptyList()
            )
        ).thenApply {
            ResponseEntity.status(HttpStatus.CREATED).body(it)
        }
    }

    @PutMapping("/{workspaceId}") //bulk edit
    fun updateWorkspace(
        @PathVariable workspaceId: String,
        @RequestBody request: UpdateWorkspaceRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        val command = UpdateWorkspaceCommand(
            workspaceId = WorkspaceId(workspaceId),
            title = request.title?.let { WorkspaceTitle(it) },
            description = request.description,
            ownerId = request.ownerId,
            memberIds = request.memberIds,
            archived = request.archived
        )

        return workspaceModificationService.updateWorkspace(command)
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { e ->
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
            }
    }

    @DeleteMapping("/{workspaceId}")
    fun deleteWorkspace(
        @PathVariable workspaceId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        val command = DeleteWorkspaceCommand(workspaceId = WorkspaceId(workspaceId))

        return workspaceModificationService.deleteWorkspace(command)
            .thenApply { ResponseEntity.noContent().build<Void>() }
            .exceptionally { e ->
                ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
            }
    }

}

data class CreateWorkspaceRequest(
    val title: String,
    val description: String? = null,
    val ownerId: String,
    val memberIds: List<String>? = null
)

data class UpdateWorkspaceRequest(
    val title: String? = null,
    val description: String? = null,
    val memberIds: List<String>? = null,
    val ownerId: String? = null,
    val archived: Boolean? = null
)