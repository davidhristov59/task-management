package mk.ukim.finki.soa.backend.model

import mk.ukim.finki.soa.backend.repository.ProjectViewJpaRepository
import org.axonframework.eventhandling.EventHandler
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.function.Consumer

@Component
class ProjectEventHandler(private val repository: ProjectViewJpaRepository) {

    @EventHandler
    fun on(event: ProjectCreatedEvent) {
        val project = ProjectView(
            projectId = event.projectId,
            title = event.title.toString(),
            description = event.description.toString(),
            workspaceId = event.workspaceId,
            ownerId = event.ownerId,
            status = event.status,
            createdAt = event.timestamp,
            lastModifiedAt = event.timestamp
        )
        repository.save(project)
    }

    @EventHandler
    fun on(event: ProjectTitleUpdatedEvent) {
        repository.findById(event.projectId).ifPresent(Consumer<ProjectView> { project ->
            project.title = event.title.toString()
            project.lastModifiedAt = event.timestamp
            repository.save(project)
        })
    }

    @EventHandler
    fun on(event: ProjectDescriptionUpdatedEvent) {
        repository.findById(event.projectId).ifPresent(Consumer<ProjectView> { project ->
            project.description = event.description.toString()
            project.lastModifiedAt = event.timestamp
            repository.save(project)
        })
    }

    @EventHandler
    fun on(event: ProjectStatusUpdatedEvent) {
        repository.findById(event.projectId).ifPresent(Consumer<ProjectView> { project ->
            project.status = event.status
            project.lastModifiedAt = event.timestamp
            repository.save(project)
        })
    }

    @EventHandler
    fun on(event: ProjectOwnerUpdatedEvent) {
        repository.findById(event.projectId).ifPresent(Consumer<ProjectView> { project ->
            project.ownerId = event.ownerId
            project.lastModifiedAt = event.timestamp
            repository.save(project)
        })
    }

    @EventHandler
    fun on(event: ProjectArchivedEvent) {
        repository.findById(event.projectId).ifPresent(Consumer<ProjectView> { project ->
            project.archived = true
            project.lastModifiedAt = event.timestamp
            repository.save(project)
        })
    }

    @EventHandler
    fun on(event: ProjectUnarchivedEvent) {
        repository.findById(event.projectId).ifPresent(Consumer<ProjectView> { project ->
            project.archived = false
            project.lastModifiedAt = event.timestamp
            repository.save(project)
        })
    }

    @EventHandler
    fun on(event: ProjectDeletedEvent) {
        repository.findById(event.projectId).ifPresent(Consumer<ProjectView> { project ->
            project.deleted = true
            project.lastModifiedAt = event.timestamp
            repository.save(project)
        })
    }
}
