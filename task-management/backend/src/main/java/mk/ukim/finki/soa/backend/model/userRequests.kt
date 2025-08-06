package mk.ukim.finki.soa.backend.model

data class CreateUserRequest(
    val name: String,
    val email: String,
    val role: UserRole = UserRole.STUDENT
)

data class UpdateUserNameRequest(
    val name: String
)

data class UpdateUserEmailRequest(
    val email: String
)

data class UpdateUserRoleRequest(
    val role: UserRole
)