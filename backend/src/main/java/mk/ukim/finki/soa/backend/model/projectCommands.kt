package mk.ukim.finki.soa.backend.model

import org.axonframework.modelling.command.TargetAggregateIdentifier

abstract class ProjectCommand(
    @TargetAggregateIdentifier open val projectId: ProjectId
)

data class CreateProjectCommand(
    override val projectId: ProjectId,
    val title: ProjectTitle,
    val description: ProjectDescription,
    val workspaceId: WorkspaceId,
    val ownerId: String
) : ProjectCommand(projectId)

data class UpdateProjectCommand(
    override val projectId: ProjectId,
    val title: ProjectTitle? = null,
    val description: ProjectDescription? = null,
    val status: ProjectStatus? = null,
    val ownerId: String? = null,
    val archived: Boolean? = null
) : ProjectCommand(projectId)

data class ArchiveProjectCommand(
    override val projectId: ProjectId
) : ProjectCommand(projectId)

data class UnarchiveProjectCommand(
    override val projectId: ProjectId
) : ProjectCommand(projectId)

data class ToggleArchiveProjectCommand(
    override val projectId: ProjectId
) : ProjectCommand(projectId)

data class DeleteProjectCommand(
    override val projectId: ProjectId
) : ProjectCommand(projectId)

data class UpdateProjectStatusCommand(
    @TargetAggregateIdentifier
    override val projectId: ProjectId,
    val status: ProjectStatus,
    val updatedBy: String? = null,
    val reason: String? = null
) : ProjectCommand(projectId)

data class UpdateProjectOwnerCommand(
    @TargetAggregateIdentifier
    override val projectId: ProjectId,
    val newOwnerId: String
) : ProjectCommand(projectId)