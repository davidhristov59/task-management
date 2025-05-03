package mk.ukim.finki.soa.backend.model

import jakarta.persistence.Embeddable
import java.util.*

// TODO: Discuss if we want this moved to a ids.kt file
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import java.io.Serializable
import java.util.*

class WorkspaceId @JsonCreator constructor(val id: String) : Serializable {

    constructor() : this(UUID.randomUUID().toString())

    @JsonValue
    override fun toString(): String = id

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other?.javaClass != javaClass) return false

        other as WorkspaceId
        return id == other.id
    }

    override fun hashCode(): Int = id.hashCode()
}

class WorkspaceTitle @JsonCreator constructor(val value: String) : Serializable {

    init {
        require(value.isNotBlank()) { "Workspace title must not be blank" }
        require(value.length <= 100) { "Workspace title must not exceed 100 characters" }
    }

    @JsonValue
    override fun toString(): String = value

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other?.javaClass != javaClass) return false

        other as WorkspaceTitle
        return value == other.value
    }

    override fun hashCode(): Int = value.hashCode()
}