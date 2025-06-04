package mk.ukim.finki.soa.backend.model

import java.io.Serializable
import java.time.LocalDateTime

data class TaskId(val value: String) : Serializable {
    override fun toString(): String = value
}

data class TaskTitle(val value: String) : Serializable {
    init {
        require(value.isNotBlank()) { "Task title cannot be blank" }
        require(value.length <= 100) { "Task title cannot exceed 100 characters" }
    }
    override fun toString(): String = value
}

data class TaskDescription(val value: String) : Serializable {
    init {
        require(value.length <= 2000) { "Task description cannot exceed 2000 characters" }
    }
    override fun toString(): String = value
}

enum class TaskStatus {
    PENDING, IN_PROGRESS, COMPLETED
}

enum class TaskPriority {
    LOW, MEDIUM, HIGH
}

data class Deadline(val date: LocalDateTime) : Serializable

enum class RecurrenceType {
    DAILY, WEEKLY, MONTHLY
}

data class RecurrenceRule(
    val type: RecurrenceType,
    val interval: Int,
    val endDate: LocalDateTime?
) : Serializable {
    init {
        require(interval > 0) { "Recurrence interval must be positive" }
    }
}

data class Tag(val id: String, val name: String) : Serializable

data class Category(val id: String, val name: String) : Serializable
