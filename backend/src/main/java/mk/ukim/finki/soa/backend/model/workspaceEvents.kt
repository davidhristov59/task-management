package mk.ukim.finki.soa.backend.model

// TODO: Would call this file events since we will have all events here regardless of aggregates
import java.time.Instant

abstract class WorkspaceEvent(
    open val workspaceId: WorkspaceId,
    val timestamp: Instant = Instant.now()
)

data class WorkspaceCreatedEvent(
    override val workspaceId: WorkspaceId,
    val title: WorkspaceTitle,
    val ownerId: String
) : WorkspaceEvent(workspaceId)

data class WorkspaceTitleUpdatedEvent(
    override val workspaceId: WorkspaceId,
    val title: WorkspaceTitle
) : WorkspaceEvent(workspaceId)

data class MemberAddedToWorkspaceEvent(
    override val workspaceId: WorkspaceId,
    val memberId: String
) : WorkspaceEvent(workspaceId)

data class MemberRemovedFromWorkspaceEvent(
    override val workspaceId: WorkspaceId,
    val memberId: String
) : WorkspaceEvent(workspaceId)

data class WorkspaceArchivedEvent(
    override val workspaceId: WorkspaceId
) : WorkspaceEvent(workspaceId)