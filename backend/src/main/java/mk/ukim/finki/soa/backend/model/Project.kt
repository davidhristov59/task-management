package mk.ukim.finki.soa.backend.model

import org.axonframework.commandhandling.CommandHandler
import org.axonframework.eventsourcing.EventSourcingHandler
import org.axonframework.modelling.command.AggregateIdentifier
import org.axonframework.modelling.command.AggregateLifecycle
import org.axonframework.spring.stereotype.Aggregate

@Aggregate
class Project {

    @AggregateIdentifier
    private lateinit var id: ProjectId
    private lateinit var title: ProjectTitle
    private lateinit var description: ProjectDescription
    private lateinit var workspaceId: WorkspaceId
    private lateinit var ownerId: String
    private var status: ProjectStatus = ProjectStatus.PLANNING
    private var archived: Boolean = false

    constructor()

    @CommandHandler
    constructor(command: CreateProjectCommand) {
        val event = ProjectCreatedEvent(
            projectId = command.projectId,
            title = command.title,
            description = command.description,
            workspaceId = command.workspaceId,
            ownerId = command.ownerId
        )
        AggregateLifecycle.apply(event)
    }

    @CommandHandler
    fun handle(command: UpdateProjectCommand) {
        validateNotArchived()

        command.title?.let {
            AggregateLifecycle.apply(ProjectTitleUpdatedEvent(command.projectId, it))
        }

        command.description?.let {
            AggregateLifecycle.apply(ProjectDescriptionUpdatedEvent(command.projectId, it))
        }

        command.status?.let {
            AggregateLifecycle.apply(ProjectStatusUpdatedEvent(command.projectId, it))
        }

        command.ownerId?.let {
            AggregateLifecycle.apply(ProjectOwnerUpdatedEvent(command.projectId, it))
        }

        command.archived?.let {
            if (it && !archived) {
                AggregateLifecycle.apply(ProjectArchivedEvent(command.projectId))
            } else if (!it && archived) {
                AggregateLifecycle.apply(ProjectUnarchivedEvent(command.projectId))
            } else {
                println("No change in archived status for project ${command.projectId}")
            }
        }
    }

    @CommandHandler
    fun handle(command: ArchiveProjectCommand) {
        validateNotArchived()
        AggregateLifecycle.apply(ProjectArchivedEvent(command.projectId))
    }

    @CommandHandler
    fun handle(command: DeleteProjectCommand) {
        AggregateLifecycle.apply(ProjectDeletedEvent(command.projectId))
    }

    @EventSourcingHandler
    fun on(event: ProjectCreatedEvent) {
        id = event.projectId
        title = event.title
        description = event.description
        workspaceId = event.workspaceId
        ownerId = event.ownerId
        status = event.status
    }

    @EventSourcingHandler
    fun on(event: ProjectTitleUpdatedEvent) {
        title = event.title
    }

    @EventSourcingHandler
    fun on(event: ProjectDescriptionUpdatedEvent) {
        description = event.description
    }

    @EventSourcingHandler
    fun on(event: ProjectStatusUpdatedEvent) {
        status = event.status
    }

    @EventSourcingHandler
    fun on(event: ProjectOwnerUpdatedEvent) {
        ownerId = event.ownerId
    }

    @EventSourcingHandler
    fun on(event: ProjectArchivedEvent) {
        archived = true
    }

    @EventSourcingHandler
    fun on(event: ProjectUnarchivedEvent) {
        archived = false
    }

    private fun validateNotArchived() {
        if (archived) {
            throw IllegalStateException("Cannot modify an archived project")
        }
    }

    @CommandHandler
    fun handle(command: UpdateProjectStatusCommand) {
        validateNotArchived()

        if (status == command.status) {
            // No change needed
            return
        }

        // Validate status transition
        when (command.status) {
            ProjectStatus.COMPLETED -> {
                if (status == ProjectStatus.CANCELLED) {
                    throw IllegalStateException("Cannot complete a cancelled project")
                }
            }
            ProjectStatus.CANCELLED -> {
                if (status == ProjectStatus.COMPLETED) {
                    throw IllegalStateException("Cannot cancel a completed project")
                }
            }
            else -> {
            }
        }

        AggregateLifecycle.apply(
            ProjectStatusUpdatedEvent(
                projectId = id,
                status = command.status
            )
        )

        @CommandHandler
        fun handle(command: UpdateProjectOwnerCommand) {
            validateNotArchived()

            if (ownerId == command.newOwnerId) {
                // No change needed
                return
            }

            AggregateLifecycle.apply(
                ProjectOwnerUpdatedEvent(
                    projectId = id,
                    ownerId = command.newOwnerId
                )
            )
        }
    }
}
