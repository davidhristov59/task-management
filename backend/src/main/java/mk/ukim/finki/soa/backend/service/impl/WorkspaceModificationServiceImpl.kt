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
        return try {
            val workspace = workspaceViewReadService.findById(command.workspaceId)
            
            // Auto-archive the workspace if it's not already archived
            if (!workspace.archived) {
                // First archive the workspace, then delete it
                val archiveCommand = UpdateWorkspaceCommand(
                    workspaceId = command.workspaceId,
                    archived = true
                )
                return commandGateway.send<WorkspaceId>(archiveCommand)
                    .thenCompose { 
                        // After archiving, proceed with deletion
                        commandGateway.send(command)
                    }
            } else {
                commandGateway.send(command)
            }
        } catch (e: Exception) {
            CompletableFuture.failedFuture(e)
        }
    }

    override fun addMemberToWorkspace(command: AddMemberToWorkspaceCommand): CompletableFuture<WorkspaceId> {
        return try {
            val workspace = workspaceViewReadService.findById(command.workspaceId)

            if (workspace.archived) {
                CompletableFuture.failedFuture(IllegalStateException("Workspace must not be archived before adding members"))
            } else {
                val memberIds = workspace.getMemberIdsList()
                if (memberIds.contains(command.memberId)) {
                    CompletableFuture.failedFuture(IllegalStateException("Member already exists in the workspace"))
                } else {
                    commandGateway.send(command)
                }
            }
        } catch (e: Exception) {
            CompletableFuture.failedFuture(e)
        }
    }

    override fun removeMemberFromWorkspace(command: RemoveMemberFromWorkspaceCommand): CompletableFuture<WorkspaceId> {
        return try {
            val workspace = workspaceViewReadService.findById(command.workspaceId)

            if (workspace.archived) {
                CompletableFuture.failedFuture(IllegalStateException("Workspace must not be archived before removing members"))
            } else {
                val memberIds = workspace.getMemberIdsList()
                if (!memberIds.contains(command.memberId)) {
                    CompletableFuture.failedFuture(IllegalStateException("Member does not exist in the workspace"))
                } else {
                    commandGateway.send(command)
                }
            }
        } catch (e: Exception) {
            CompletableFuture.failedFuture(e)
        }
    }
}