package mk.ukim.finki.soa.backend.model

// TODO: Would call this file events since we will have all events here regardless of aggregates
data class WorkspaceCreatedEvent(
    val workspaceId: WorkspaceId,
    val title: WorkspaceTitle,
    val ownerId: String
)

data class WorkspaceTitleUpdatedEvent(
    val workspaceId: WorkspaceId,
    val title: WorkspaceTitle
)

data class WorkspaceArchivedEvent(
    val command: ArchiveWorkspaceCommand
)

data class MemberAddedToWorkspaceEvent(
    val workspaceId: WorkspaceId,
    val memberId: String
)