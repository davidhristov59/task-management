package mk.ukim.finki.soa.backend.model


// TODO: Would call this file commands since we will have all commands here regardless of aggregates
/*-------------- Workspace --------------*/
import org.axonframework.modelling.command.TargetAggregateIdentifier

abstract class WorkspaceCommand(
    @TargetAggregateIdentifier open val workspaceId: WorkspaceId
)

data class CreateWorkspaceCommand(
    override val workspaceId: WorkspaceId,
    val title: WorkspaceTitle,
    val ownerId: String
) : WorkspaceCommand(workspaceId)

data class UpdateWorkspaceTitleCommand(
    override val workspaceId: WorkspaceId,
    val title: WorkspaceTitle
) : WorkspaceCommand(workspaceId)

data class AddMemberToWorkspaceCommand(
    override val workspaceId: WorkspaceId,
    val memberId: String
) : WorkspaceCommand(workspaceId)

data class RemoveMemberFromWorkspaceCommand(
    override val workspaceId: WorkspaceId,
    val memberId: String
) : WorkspaceCommand(workspaceId)

data class ArchiveWorkspaceCommand(
    override val workspaceId: WorkspaceId
) : WorkspaceCommand(workspaceId)