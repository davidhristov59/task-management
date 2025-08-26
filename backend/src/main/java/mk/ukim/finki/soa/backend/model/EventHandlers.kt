package mk.ukim.finki.soa.backend.model

import mk.ukim.finki.soa.backend.repository.WorkspaceViewRepository
import org.axonframework.eventhandling.EventHandler
import org.springframework.stereotype.Component

@Component
class WorkspaceEventHandler(private val repository: WorkspaceViewRepository) {

    @EventHandler
    fun on(event: WorkspaceCreatedEvent) {
        val workspace = WorkspaceView(
            workspaceId = event.workspaceId,
            title = event.title.toString(),
            description = event.description,
            ownerId = event.ownerId,
            memberIds = event.memberIds.joinToString(","),
            createdAt = event.timestamp,
            lastModifiedAt = event.timestamp
        )

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
            workspace.memberIds = event.memberIds.joinToString(",")
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: MemberAddedToWorkspaceEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            val currentMembers = workspace.getMemberIdsList().toMutableSet()
            currentMembers.add(event.memberId)
            workspace.memberIds = currentMembers.joinToString(",")
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }

    @EventHandler
    fun on(event: MemberRemovedFromWorkspaceEvent) {
        repository.findById(event.workspaceId).ifPresent { workspace ->
            val currentMembers = workspace.getMemberIdsList().toMutableSet()
            val memberToRemove = event.memberId
            val jsonMemberToRemove = "{\"userId\":\"$memberToRemove\"}"
            
            val wasRemovedPlain = currentMembers.remove(memberToRemove)
            val wasRemovedJson = currentMembers.remove(jsonMemberToRemove)
            val wasRemoved = wasRemovedPlain || wasRemovedJson
            
            workspace.memberIds = currentMembers.joinToString(",")
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
            workspace.deleted = true
            workspace.lastModifiedAt = event.timestamp
            repository.save(workspace)
        }
    }
}