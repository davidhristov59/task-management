package mk.ukim.finki.soa.backend.model

import org.axonframework.commandhandling.CommandHandler
import org.axonframework.eventsourcing.EventSourcingHandler
import org.axonframework.modelling.command.AggregateIdentifier
import org.axonframework.modelling.command.AggregateLifecycle
import org.axonframework.spring.stereotype.Aggregate

@Aggregate
class User {

    @AggregateIdentifier
    private lateinit var id: UserId
    private lateinit var name: UserName
    private lateinit var email: UserEmail
    private lateinit var role: UserRole
    private var active: Boolean = true

    constructor()

    @CommandHandler
   constructor(command: CreateUserCommand) : this() {
        val event = UserCreatedEvent(
            userId = command.userId,
            name = command.name,
            email = command.email,
            role = command.role
        )
        AggregateLifecycle.apply(event)
   }

    @CommandHandler
    fun handle(command: UpdateUserNameCommand) {
        validateActive()
        AggregateLifecycle.apply(UserNameUpdatedEvent(command.userId, command.name))
    }

    @CommandHandler
    fun handle(command: UpdateUserEmailCommand){
        validateActive()
        AggregateLifecycle.apply(UserEmailUpdatedEvent(command.userId, command.email))
    }

    @CommandHandler
    fun handle(command: UpdateUserRoleCommand){
        validateActive()
        AggregateLifecycle.apply(UserRoleChangedEvent(command.userId, role, command.newRole))
    }

    @CommandHandler
    fun handle(command: DeactivateUserCommand) {
        if (!active) {
            throw IllegalStateException("User is already deactivated")
        }
        AggregateLifecycle.apply(UserDeactivatedEvent(command.userId))
    }

    @CommandHandler
    fun handle(command: ActivateUserCommand) {
        if (active) {
            throw IllegalStateException("User is already active")
        }
        AggregateLifecycle.apply(UserActivatedEvent(command.userId))
    }

    @EventSourcingHandler
    fun on(event: UserCreatedEvent) {
        id = event.userId
        name = event.name
        email = event.email
        role = event.role
        active = true
    }

    @EventSourcingHandler
    fun on(event: UserNameUpdatedEvent) {
        name = event.name
    }

    @EventSourcingHandler
    fun on(event: UserEmailUpdatedEvent) {
        email = event.email
    }

    @EventSourcingHandler
    fun on(event: UserRoleChangedEvent) {
        role = event.new_role
    }

    @EventSourcingHandler
    fun on(event: UserDeactivatedEvent) {
        active = false
    }

    @EventSourcingHandler
    fun on(event: UserActivatedEvent) {
        active = true
    }

    private fun validateActive() {
        if (!active) {
            throw IllegalStateException("Cannot modify a deactivated user")
        }
    }
}