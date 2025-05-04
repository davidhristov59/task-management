package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.model.AddMemberToWorkspaceCommand
import mk.ukim.finki.soa.backend.model.ArchiveWorkspaceCommand
import mk.ukim.finki.soa.backend.model.CreateWorkspaceCommand
import mk.ukim.finki.soa.backend.model.RemoveMemberFromWorkspaceCommand
import mk.ukim.finki.soa.backend.model.UpdateWorkspaceTitleCommand
import mk.ukim.finki.soa.backend.model.WorkspaceId
import mk.ukim.finki.soa.backend.model.WorkspaceTitle
import mk.ukim.finki.soa.backend.model.WorkspaceView
import mk.ukim.finki.soa.backend.repository.WorkspaceViewJpaRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.concurrent.CompletableFuture
import mk.ukim.finki.soa.backend.model.*
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
        @RequestParam(required = false) workspaceId: WorkspaceId?,
        @RequestParam(required = false) archived: Boolean?,
        @RequestParam(required = false) ownerId: String?,
        @RequestParam(required = false) memberId: String?
    ): List<WorkspaceView> {
        return workspaceViewReadService.findAllFilter(
            workspaceId,
            ownerId,
            memberId,
            archived,
        )
    }

    @GetMapping("/{id}")
    fun findById(@PathVariable id: String): ResponseEntity<WorkspaceView> {
        val workspaceId = WorkspaceId(id) // Assuming WorkspaceId has a constructor that accepts a String
        val workspace = workspaceViewReadService.findById(workspaceId)
        try {
            return ResponseEntity.ok(workspace)
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null)
        }
    }

    @PostMapping
    fun createWorkspace(
        @RequestBody request: CreateWorkspaceRequest
    ): ResponseEntity<Any> {
        val workspaceId = WorkspaceId()

        return ResponseEntity.ok(
            workspaceModificationService.createWorkspace(
            CreateWorkspaceCommand(
                workspaceId = workspaceId,
                title = WorkspaceTitle(request.title),
                ownerId = request.ownerId
        )));
    }

    @PutMapping("/{id}")
    fun updateWorkspace(
        @PathVariable id: String,
        @RequestBody request: UpdateTitleRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Void>(
            UpdateWorkspaceTitleCommand(
                workspaceId = WorkspaceId(id),
                title = WorkspaceTitle(request.title)
            )
        ).thenApply {
            ResponseEntity.ok().build()
        }
    }

    @PostMapping("/{id}/members")
    fun addMember(
        @PathVariable id: String,
        @RequestBody request: MemberRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Void>(
            AddMemberToWorkspaceCommand(
                workspaceId = WorkspaceId(id),
                memberId = request.memberId
            )
        ).thenApply {
            ResponseEntity.ok().build()
        }
    }

    @DeleteMapping("/{id}/members/{memberId}")
    fun removeMember(
        @PathVariable id: String,
        @PathVariable memberId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Void>(
            RemoveMemberFromWorkspaceCommand(
                workspaceId = WorkspaceId(id),
                memberId = memberId
            )
        ).thenApply {
            ResponseEntity.ok().build()
        }
    }
}

data class CreateWorkspaceRequest(
    val title: String,
    val ownerId: String
)

data class UpdateTitleRequest(
    val title: String
)

data class MemberRequest(
    val memberId: String
)
