package mk.ukim.finki.soa.backend.service.impl

import mk.ukim.finki.soa.backend.model.CreateWorkspaceCommand
import mk.ukim.finki.soa.backend.model.WorkspaceId
import mk.ukim.finki.soa.backend.service.WorkspaceModificationService
import org.axonframework.commandhandling.gateway.CommandGateway
import org.springframework.stereotype.Service
import java.util.concurrent.CompletableFuture

@Service
class WorkspaceModificationServiceImpl(
    val commandGateway: CommandGateway,
) : WorkspaceModificationService {
    override fun createWorkspace(command: CreateWorkspaceCommand): CompletableFuture<WorkspaceId> {
        return commandGateway.send(command);
    }
}

