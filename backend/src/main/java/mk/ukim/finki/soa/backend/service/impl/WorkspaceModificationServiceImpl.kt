package mk.ukim.finki.soa.backend.service.impl

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.service.WorkspaceModificationService
import mk.ukim.finki.soa.backend.service.WorkspaceViewReadService
import org.axonframework.commandhandling.gateway.CommandGateway
import org.springframework.stereotype.Service
import java.util.concurrent.CompletableFuture

@Service
class WorkspaceModificationServiceImpl(
    private val commandGateway: CommandGateway,
    private val workspaceViewReadService: WorkspaceViewReadService,
) : WorkspaceModificationService {

    override fun createWorkspace(command: CreateWorkspaceCommand): CompletableFuture<WorkspaceId> {
        return commandGateway.send(command)
    }

    override fun updateWorkspace(command: UpdateWorkspaceCommand): CompletableFuture<WorkspaceId> {
        return commandGateway.send(command)
    }

    override fun deleteWorkspace(command: DeleteWorkspaceCommand): CompletableFuture<WorkspaceId> {
        val workspace = workspaceViewReadService.findById(command.workspaceId)

        if (!workspace.archived) {
            throw IllegalStateException("Workspace must be archived before deleting")
        }

        return commandGateway.send(command)
    }

    override fun addMemberToWorkspace(command: AddMemberToWorkspaceCommand): CompletableFuture<WorkspaceId> {
        val workspace = workspaceViewReadService.findById(command.workspaceId)

        if (workspace.archived) {
            throw IllegalStateException("Workspace must not be archived before adding members")
        }

        val memberIds = workspace.getMemberIdsList()
        if (memberIds.contains(command.memberId)) {
            throw IllegalStateException("Member already exists in the workspace")
        }

        return commandGateway.send(command)
    }

    override fun removeMemberFromWorkspace(command: RemoveMemberFromWorkspaceCommand): CompletableFuture<WorkspaceId> {
        val workspace = workspaceViewReadService.findById(command.workspaceId)

        if (workspace.archived) {
            throw IllegalStateException("Workspace must not be archived before removing members")
        }

        val memberIds = workspace.getMemberIdsList()
        if (!memberIds.contains(command.memberId)) {
            throw IllegalStateException("Member does not exist in the workspace")
        }

        return commandGateway.send(command)
    }
}