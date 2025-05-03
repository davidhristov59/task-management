package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.model.*
import org.axonframework.commandhandling.gateway.CommandGateway
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.concurrent.CompletableFuture

@RestController
@RequestMapping("/workspaces/commands")
class CommandDispatcherRestApi(private val commandGateway: CommandGateway) {

    @PostMapping
    fun createWorkspace(@RequestBody request: CreateWorkspaceRequest):
            CompletableFuture<ResponseEntity<String>> {
        val workspaceId = WorkspaceId()

        return commandGateway.send<WorkspaceId>(
            CreateWorkspaceCommand(
                workspaceId = workspaceId,
                title = WorkspaceTitle(request.title),
                ownerId = request.ownerId
            )
        ).thenApply {
            ResponseEntity.status(HttpStatus.CREATED)
                .body(it.toString())
        }
    }

    @PutMapping("/{id}/title")
    fun updateTitle(
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

    @PostMapping("/{id}/archive")
    fun archiveWorkspace(@PathVariable id: String): CompletableFuture<ResponseEntity<Void>> {
        return commandGateway.send<Void>(
            ArchiveWorkspaceCommand(
                workspaceId = WorkspaceId(id)
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