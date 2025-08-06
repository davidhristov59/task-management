package mk.ukim.finki.soa.backend.model

import org.axonframework.modelling.command.TargetAggregateIdentifier

abstract class UserCommand(
    @TargetAggregateIdentifier open val userId: UserId
)

data class CreateUserCommand(
    override val userId: UserId,
    val name: UserName,
    val email: UserEmail,
    val role: UserRole = UserRole.STUDENT
) : UserCommand(userId)

data class UpdateUserNameCommand(
    override val userId: UserId,
    val name: UserName
) : UserCommand(userId)

data class UpdateUserEmailCommand(
    override val userId: UserId,
    val email: UserEmail
) : UserCommand(userId)

data class UpdateUserRoleCommand(
    override val userId: UserId,
    val newRole: UserRole
) : UserCommand(userId)

data class DeactivateUserCommand(
    override val userId: UserId
) : UserCommand(userId)

data class ActivateUserCommand(
    override val userId: UserId
) : UserCommand(userId)