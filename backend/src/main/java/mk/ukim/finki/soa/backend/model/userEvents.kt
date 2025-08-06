package mk.ukim.finki.soa.backend.model

import java.time.Instant

abstract class UserEvent(
    open val userId: UserId,
    open val timestamp: Instant = Instant.now()
)

data class UserCreatedEvent(
    override val userId: UserId,
    val name: UserName,
    val email: UserEmail,
    val role: UserRole = UserRole.STUDENT,
) : UserEvent(userId)

data class UserNameUpdatedEvent(
    override val userId: UserId,
    val name: UserName,
) : UserEvent(userId)

data class UserEmailUpdatedEvent(
    override val userId: UserId,
    val email: UserEmail,
) : UserEvent(userId)

data class UserRoleChangedEvent(
    override val userId: UserId,
    val old_role: UserRole,
    val new_role: UserRole,
) : UserEvent(userId)

data class UserDeactivatedEvent(
    override val userId: UserId
) : UserEvent(userId)

data class UserActivatedEvent(
    override val userId: UserId
) : UserEvent(userId)