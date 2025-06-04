package mk.ukim.finki.soa.backend.model

import java.io.Serializable

data class ProjectId(val value: String) : Serializable {
    override fun toString(): String = value
}

data class ProjectTitle(val value: String) : Serializable {
    init {
        require(value.isNotBlank()) { "Project title cannot be blank" }
        require(value.length <= 100) { "Project title cannot exceed 100 characters" }
    }
    override fun toString(): String = value
}

data class ProjectDescription(val value: String) : Serializable {
    init {
        require(value.length <= 1000) { "Project description cannot exceed 1000 characters" }
    }
    override fun toString(): String = value
}

enum class ProjectStatus {
    PLANNING, IN_PROGRESS, COMPLETED
}
