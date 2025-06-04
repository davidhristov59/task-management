package mk.ukim.finki.soa.backend.model

import java.time.Instant

abstract class ProjectEvent(
    open val projectId: ProjectId,
    val timestamp: Instant = Instant.now()
)

data class ProjectCreatedEvent(
    override val projectId: ProjectId,
    val title: ProjectTitle,
    val description: ProjectDescription,
    val workspaceId: WorkspaceId,
    val ownerId: String,
    val status: ProjectStatus = ProjectStatus.PLANNING
) : ProjectEvent(projectId)

data class ProjectTitleUpdatedEvent(
    override val projectId: ProjectId,
    val title: ProjectTitle
) : ProjectEvent(projectId)

data class ProjectDescriptionUpdatedEvent(
    override val projectId: ProjectId,
    val description: ProjectDescription
) : ProjectEvent(projectId)

data class ProjectStatusUpdatedEvent(
    override val projectId: ProjectId,
    val status: ProjectStatus
) : ProjectEvent(projectId)

data class ProjectOwnerUpdatedEvent(
    override val projectId: ProjectId,
    val ownerId: String
) : ProjectEvent(projectId)

data class ProjectArchivedEvent(
    override val projectId: ProjectId
) : ProjectEvent(projectId)

data class ProjectUnarchivedEvent(
    override val projectId: ProjectId
) : ProjectEvent(projectId)

data class ProjectDeletedEvent(
    override val projectId: ProjectId
) : ProjectEvent(projectId)
