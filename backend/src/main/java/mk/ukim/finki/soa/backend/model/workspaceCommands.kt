package mk.ukim.finki.soa.backend.model

import org.axonframework.modelling.command.TargetAggregateIdentifier

abstract class WorkspaceCommand(
    @TargetAggregateIdentifier open val workspaceId: WorkspaceId
)

data class CreateWorkspaceCommand(
    override val workspaceId: WorkspaceId,
    val title: WorkspaceTitle,
    val description: String? = null,
    val ownerId: String,
    val memberIds: List<String> = emptyList()
) : WorkspaceCommand(workspaceId)

data class UpdateWorkspaceCommand(
    override val workspaceId: WorkspaceId,
    val title: WorkspaceTitle? = null,
    val description: String? = null,
    val ownerId: String? = null,
    val memberIds: List<String>? = null,
    val archived: Boolean? = null
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

data class DeleteWorkspaceCommand(
    override val workspaceId: WorkspaceId
) : WorkspaceCommand(workspaceId)