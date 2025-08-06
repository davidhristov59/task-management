package mk.ukim.finki.soa.backend.model

import mk.ukim.finki.soa.backend.repository.UserViewJpaRepository
import org.axonframework.eventhandling.EventHandler
import org.springframework.stereotype.Component

@Component
class UserEventHandler(private val repository: UserViewJpaRepository) {

    @EventHandler
    fun on(event: UserCreatedEvent) {
        val user = UserView(
            userId = event.userId,
            name = event.name.toString(),
            email = event.email.toString(),
            role = event.role,
            active = true,
            createdAt = event.timestamp,
            lastModifiedAt = event.timestamp,
            deleted = false
        )
        repository.save(user)
    }

    @EventHandler
    fun on(event: UserNameUpdatedEvent){
        val user = repository.findById(event.userId)
            .orElseThrow { IllegalArgumentException("User with ID ${event.userId} not found") }
        user.name = event.name.toString()
        user.lastModifiedAt = event.timestamp

        repository.save(user)
    }

    @EventHandler
    fun on(event: UserEmailUpdatedEvent){
        val user = repository.findById(event.userId)
            .orElseThrow { IllegalArgumentException("User with ID ${event.userId} not found") }

        user.email = event.email.toString()
        user.lastModifiedAt = event.timestamp

        repository.save(user)
    }

    @EventHandler
    fun on(event: UserRoleChangedEvent){
        val user = repository.findById(event.userId)
            .orElseThrow {
                IllegalArgumentException("User with ID ${event.userId} not found")
            }

        user.role = event.new_role
        user.lastModifiedAt = event.timestamp

        repository.save(user)
    }

    @EventHandler
    fun on(event: UserActivatedEvent) {
        val user = repository.findById(event.userId)
            .orElseThrow {
            IllegalArgumentException("User with ID ${event.userId} not found")
        }

        user.active = true
        user.lastModifiedAt = event.timestamp

        repository.save(user)
    }

    @EventHandler
    fun on(event: UserDeactivatedEvent) {
        val user = repository.findById(event.userId)
            .orElseThrow {
                IllegalArgumentException("User with ID ${event.userId} not found")
            }

        user.active = false
        user.lastModifiedAt = event.timestamp

        repository.save(user)
    }
}