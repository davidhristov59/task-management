package mk.ukim.finki.soa.backend.model


// TODO: Would call this file commands since we will have all commands here regardless of aggregates
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