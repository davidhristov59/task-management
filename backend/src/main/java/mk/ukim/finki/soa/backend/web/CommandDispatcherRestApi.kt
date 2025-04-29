package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.model.CreateWorkspaceCommand
import mk.ukim.finki.soa.backend.model.CreateWorkspaceCommandDto
import mk.ukim.finki.soa.backend.service.WorkspaceModificationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/submitCommand")
class CommandDispatcherRestApi(
    val workspaceModificationService: WorkspaceModificationService,
) {
    @PostMapping("/CreateWorkspaceCommand")
    fun createWorkspace(
        @RequestBody commandDto: CreateWorkspaceCommandDto
    ): ResponseEntity<Any> {
        return ResponseEntity.ok(
            workspaceModificationService.createWorkspace(
                CreateWorkspaceCommand(
                    title = commandDto.title,
                    ownerId = commandDto.ownerId,
                )
            )
        )
    }
}