package mk.ukim.finki.soa.backend.model

import org.axonframework.modelling.command.TargetAggregateIdentifier
import java.time.ZonedDateTime

/*-------------- Workspace --------------*/

data class CreateWorkspaceCommand(
    val title: WorkspaceTitle,
    val ownerId: String
)

data class UpdateWorkspaceTitleCommand(
    val workspaceId: WorkspaceId,
    val title: WorkspaceTitle,
)

data class ArchiveWorkspaceCommand(
    val workspaceId: WorkspaceId
)

data class AddMemberToWorkspaceCommand(
    val workspaceId: WorkspaceId,
    val memberId: String
)