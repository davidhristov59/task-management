package mk.ukim.finki.soa.backend.model

import java.time.Instant

abstract class WorkspaceEvent(
    open val workspaceId: WorkspaceId,
    val timestamp: Instant = Instant.now()
)

data class WorkspaceCreatedEvent(
    override val workspaceId: WorkspaceId,
    val title: WorkspaceTitle,
    val description: String?,
    val ownerId: String,
    val memberIds: List<String> = emptyList()
) : WorkspaceEvent(workspaceId)

data class WorkspaceTitleUpdatedEvent(
    override val workspaceId: WorkspaceId,
    val title: WorkspaceTitle
) : WorkspaceEvent(workspaceId)

data class WorkspaceDescriptionUpdatedEvent(
    override val workspaceId: WorkspaceId,
    val description: String?
) : WorkspaceEvent(workspaceId)

data class WorkspaceOwnerUpdatedEvent(
    override val workspaceId: WorkspaceId,
    val ownerId: String
) : WorkspaceEvent(workspaceId)

data class WorkspaceMembersUpdatedEvent(
    override val workspaceId: WorkspaceId,
    val memberIds: List<String>
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

data class WorkspaceUnarchivedEvent(
    override val workspaceId: WorkspaceId
) : WorkspaceEvent(workspaceId)

data class WorkspaceDeletedEvent(
    override val workspaceId: WorkspaceId
) : WorkspaceEvent(workspaceId)