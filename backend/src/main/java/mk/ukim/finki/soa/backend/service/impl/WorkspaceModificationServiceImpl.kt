package mk.ukim.finki.soa.backend.service.impl

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.service.WorkspaceModificationService
import mk.ukim.finki.soa.backend.service.WorkspaceViewReadService
import org.axonframework.commandhandling.gateway.CommandGateway
import org.springframework.stereotype.Service
import java.util.concurrent.CompletableFuture

@Service
class WorkspaceModificationServiceImpl(
    val commandGateway: CommandGateway,
    val workspaceViewReadService: WorkspaceViewReadService,
) : WorkspaceModificationService {
    override fun createWorkspace(command: CreateWorkspaceCommand): CompletableFuture<WorkspaceId> {
        return commandGateway.send(command)
    }

    override fun updateWorkspace(command: UpdateWorkspaceCommand): CompletableFuture<WorkspaceId> {
        return commandGateway.send(command)
    }

    override fun deleteWorkspace(command: DeleteWorkspaceCommand): CompletableFuture<WorkspaceId> {
        val workspace = workspaceViewReadService.findById(command.workspaceId);

        if(!workspace.archived) {
            throw IllegalStateException("Workspace must be archived before deleting");
        }

        return commandGateway.send(command)
    }
}

