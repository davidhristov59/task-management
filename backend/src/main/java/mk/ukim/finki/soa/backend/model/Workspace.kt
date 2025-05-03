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
            ownerId = command.ownerId
        )

        AggregateLifecycle.apply(event)
    }

    @CommandHandler
    fun handle(command: UpdateWorkspaceTitleCommand) {
        validateNotArchived()

        val event = WorkspaceTitleUpdatedEvent(
            workspaceId = command.workspaceId,
            title = command.title
        )

        AggregateLifecycle.apply(event)
    }

    @CommandHandler
    fun handle(command: AddMemberToWorkspaceCommand) {
        validateNotArchived()

        if (memberIds.contains(command.memberId)) {
            throw IllegalArgumentException("Member is already part of the workspace")
        }

        val event = MemberAddedToWorkspaceEvent(
            workspaceId = command.workspaceId,
            memberId = command.memberId
        )

        AggregateLifecycle.apply(event)
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

        val event = MemberRemovedFromWorkspaceEvent(
            workspaceId = command.workspaceId,
            memberId = command.memberId
        )

        AggregateLifecycle.apply(event)
    }

    @CommandHandler
    fun handle(command: ArchiveWorkspaceCommand) {
        if (archived) {
            return // Already archived, idempotent operation
        }

        val event = WorkspaceArchivedEvent(
            workspaceId = command.workspaceId
        )

        AggregateLifecycle.apply(event)
    }

    @EventSourcingHandler
    fun on(event: WorkspaceCreatedEvent) {
        id = event.workspaceId
        title = event.title
        ownerId = event.ownerId
        archived = false
    }

    @EventSourcingHandler
    fun on(event: WorkspaceTitleUpdatedEvent) {
        title = event.title
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

    private fun validateNotArchived() {
        if (archived) {
            throw IllegalStateException("Cannot modify an archived workspace")
        }
    }
}
