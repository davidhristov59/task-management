package mk.ukim.finki.soa.backend.model

import java.io.Serializable

data class UserId(val value: String) : Serializable {
    override fun toString(): String = value
}

data class UserName(val value: String) : Serializable {
    init {
        require(value.isNotBlank()) { "User name cannot be blank" }
        require(value.length <= 100) { "User name cannot exceed 100 characters" }
    }
    override fun toString(): String = value
}

data class UserEmail(val value: String) : Serializable {
    init {
        require(value.isNotBlank()) { "User email cannot be blank" }
        require(value.length <= 100) { "User email cannot exceed 100 characters" }
        require(value.contains("@")) { "User email must contain '@'" }
    }
    override fun toString(): String = value
}

enum class UserRole {
    EMPLOYEE, STUDENT
}