package mk.ukim.finki.soa.backend.model

import mk.ukim.finki.soa.backend.repository.WorkspaceViewJpaRepository
import org.axonframework.eventhandling.EventHandler
import org.springframework.stereotype.Component

@Component
class WorkspaceEventHandler(private val repository: WorkspaceViewJpaRepository) {

    @EventHandler
    fun on(event: WorkspaceCreatedEvent) {
        val workspace = WorkspaceView(
            workspaceId = event.workspaceId,
            title = event.title.toString(),
            description = event.description,
            ownerId = event.ownerId,
            createdAt = event.timestamp,
            lastModifiedAt = event.timestamp
        )

        event.memberIds.forEach { workspace.memberIds.add(it) }

        repository.save(workspace)
    }

    @EventHandler
    fun on(event: WorkspaceTitleUpdatedEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            workspace.title = event.title.toString()
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: WorkspaceDescriptionUpdatedEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            workspace.description = event.description
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: WorkspaceOwnerUpdatedEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            workspace.ownerId = event.ownerId
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: WorkspaceMembersUpdatedEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            workspace.memberIds.clear()
            event.memberIds.forEach { workspace.memberIds.add(it) }
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: MemberAddedToWorkspaceEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            workspace.memberIds.add(event.memberId)
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: MemberRemovedFromWorkspaceEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            workspace.memberIds.remove(event.memberId)
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: WorkspaceArchivedEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            workspace.archived = true
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: WorkspaceUnarchivedEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            workspace.archived = false
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: WorkspaceDeletedEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            repository.delete(workspace)
        }
    }
}