package mk.ukim.finki.soa.backend.model

import jakarta.persistence.*
import org.axonframework.commandhandling.CommandHandler
import org.axonframework.modelling.command.AggregateIdentifier
import org.axonframework.modelling.command.AggregateLifecycle
import org.axonframework.spring.stereotype.Aggregate

@Entity
@Aggregate(repository = "axonWorkspaceRepository")
class Workspace : LabeledEntity {

    @AggregateIdentifier
    @EmbeddedId
    @AttributeOverride(name = "value", column = Column(name = "id"))
    lateinit var id: WorkspaceId

    @Embedded
    lateinit var title: WorkspaceTitle

    lateinit var ownerId: String

    var archived: Boolean = false

    @ElementCollection
    var memberIds: MutableList<String> = mutableListOf()

    @CommandHandler
    constructor(command: CreateWorkspaceCommand) {
        val event = WorkspaceCreatedEvent(
            workspaceId = WorkspaceId(),
            title = WorkspaceTitle(command.title.toString()),
            ownerId = command.ownerId
        )

        this.on(event)
        AggregateLifecycle.apply(event)
    }

    constructor()

    fun on(event: WorkspaceCreatedEvent) {
        this.id = event.workspaceId
        this.title = event.title
        this.ownerId = event.ownerId
        this.archived = false
        this.memberIds = mutableListOf()
    }

    fun updateTitle(command: UpdateWorkspaceTitleCommand) {
        val event = WorkspaceTitleUpdatedEvent(
            workspaceId = command.workspaceId,
            title = WorkspaceTitle(command.title.toString())
        )

        this.on(event)
        AggregateLifecycle.apply(event)
    }

    fun on(event: WorkspaceTitleUpdatedEvent) {
        this.title = event.title
    }

    @CommandHandler
    fun archive(command: ArchiveWorkspaceCommand) {
        val event = WorkspaceArchivedEvent(command)

        this.on(event)
        AggregateLifecycle.apply(event)
    }

    fun on(event: WorkspaceArchivedEvent) {
        this.archived = true
    }

    fun addMember(command: AddMemberToWorkspaceCommand) {
        val event = MemberAddedToWorkspaceEvent( //added event for new member added to the workspace
            workspaceId = command.workspaceId,
            memberId = command.memberId
        )

        this.on(event)
        AggregateLifecycle.apply(event)
    }

    fun on(event: MemberAddedToWorkspaceEvent) {
        this.memberIds.add(event.memberId)
    }

    override fun getId(): Identifier<out Any> {
        return id
    }

    override fun getLabel(): String {
        return title.value
    }
}
