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

data class DeleteProjectCommand(
    override val projectId: ProjectId
) : ProjectCommand(projectId)
