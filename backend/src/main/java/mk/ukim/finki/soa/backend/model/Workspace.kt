package mk.ukim.finki.soa.backend.model

import jakarta.persistence.*
import org.axonframework.commandhandling.CommandHandler
import org.axonframework.eventsourcing.EventSourcingHandler
import org.axonframework.modelling.command.AggregateIdentifier
import org.axonframework.modelling.command.AggregateLifecycle
import org.axonframework.spring.stereotype.Aggregate

@Aggregate
class Workspace {

    @AggregateIdentifier
    private lateinit var id: WorkspaceId
    private lateinit var title: WorkspaceTitle
    private lateinit var ownerId: String
    private var description: String? = null
    private val memberIds: MutableSet<String> = mutableSetOf()
    private var archived: Boolean = false

    constructor() // Required by Axon

    @CommandHandler
    constructor(command: CreateWorkspaceCommand) {
        if (command.workspaceId == null) {
            throw IllegalArgumentException("Workspace ID cannot be null")
        }

        val event = WorkspaceCreatedEvent(
            workspaceId = command.workspaceId,
            title = command.title,
            description = command.description,
            ownerId = command.ownerId,
            memberIds = command.memberIds
        )

        AggregateLifecycle.apply(event)
    }

    @CommandHandler
    fun handle(command: UpdateWorkspaceCommand) {
        validateNotArchived()

        command.title?.let {
            AggregateLifecycle.apply(WorkspaceTitleUpdatedEvent(command.workspaceId, it))
        }

        command.description?.let {
            AggregateLifecycle.apply(WorkspaceDescriptionUpdatedEvent(command.workspaceId, it))
        }

        command.ownerId?.let {
            AggregateLifecycle.apply(WorkspaceOwnerUpdatedEvent(command.workspaceId, it))
        }

        command.memberIds?.let {
            AggregateLifecycle.apply(WorkspaceMembersUpdatedEvent(command.workspaceId, it))
        }

        command.archived?.let {
            if (it && !archived) {
                AggregateLifecycle.apply(WorkspaceArchivedEvent(command.workspaceId))
            } else if (!it && archived) {
                AggregateLifecycle.apply(WorkspaceUnarchivedEvent(command.workspaceId))
            }else {
                //do nothing
            }
        }
    }

    @CommandHandler
    fun handle(command: UpdateWorkspaceTitleCommand) {
        validateNotArchived()
        AggregateLifecycle.apply(WorkspaceTitleUpdatedEvent(command.workspaceId, command.title))
    }

    @CommandHandler
    fun handle(command: AddMemberToWorkspaceCommand) {
        validateNotArchived()

        if (memberIds.contains(command.memberId)) {
            throw IllegalArgumentException("Member is already part of the workspace")
        }

        AggregateLifecycle.apply(MemberAddedToWorkspaceEvent(command.workspaceId, command.memberId))
    }

    @CommandHandler
    fun handle(command: RemoveMemberFromWorkspaceCommand) {
        validateNotArchived()

        if (!memberIds.contains(command.memberId)) {
            throw IllegalArgumentException("Member is not part of the workspace")
        }

        if (command.memberId == ownerId) {
            throw IllegalArgumentException("Cannot remove the workspace owner")
        }

        AggregateLifecycle.apply(MemberRemovedFromWorkspaceEvent(command.workspaceId, command.memberId))
    }

    @CommandHandler
    fun handle(command: ArchiveWorkspaceCommand) {
        if (archived) return
        AggregateLifecycle.apply(WorkspaceArchivedEvent(command.workspaceId))
    }

    @CommandHandler
    fun handle(command: DeleteWorkspaceCommand) {
        if (archived) {
            AggregateLifecycle.apply(WorkspaceDeletedEvent(command.workspaceId))
        } else {
            throw IllegalStateException("Only archived workspaces can be deleted")
        }
    }

    @EventSourcingHandler
    fun on(event: WorkspaceCreatedEvent) {
        id = event.workspaceId
        title = event.title
        description = event.description
        ownerId = event.ownerId
        memberIds.addAll(event.memberIds)
        archived = false
    }

    @EventSourcingHandler
    fun on(event: WorkspaceTitleUpdatedEvent) {
        title = event.title
    }

    @EventSourcingHandler
    fun on(event: WorkspaceDescriptionUpdatedEvent) {
        description = event.description
    }

    @EventSourcingHandler
    fun on(event: WorkspaceOwnerUpdatedEvent) {
        ownerId = event.ownerId
    }

    @EventSourcingHandler
    fun on(event: WorkspaceMembersUpdatedEvent) {
        memberIds.clear()
        memberIds.addAll(event.memberIds)
    }

    @EventSourcingHandler
    fun on(event: MemberAddedToWorkspaceEvent) {
        memberIds.add(event.memberId)
    }

    @EventSourcingHandler
    fun on(event: MemberRemovedFromWorkspaceEvent) {
        memberIds.remove(event.memberId)
    }

    @EventSourcingHandler
    fun on(event: WorkspaceArchivedEvent) {
        archived = true
    }

    @EventSourcingHandler
    fun on(event: WorkspaceUnarchivedEvent) {
        archived = false
    }

    private fun validateNotArchived() {
        if (archived) {
            throw IllegalStateException("Cannot modify an archived workspace")
        }
    }
}
