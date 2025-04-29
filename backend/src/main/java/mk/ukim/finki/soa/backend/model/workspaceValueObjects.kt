package mk.ukim.finki.soa.backend.model

import jakarta.persistence.Embeddable
import java.util.*


// TODO: Discuss if we want this moved to a ids.kt file
@Embeddable
open class WorkspaceId(value: String) : Identifier<Workspace>(value, Workspace::class.java) {
    constructor() : this(UUID.randomUUID().toString())

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other?.javaClass != javaClass) return false

        return this.value == (other as WorkspaceId).value
    }

    override fun hashCode(): Int {
        return value.hashCode()
    }
}


// TODO: Discuss if we want the value object to have custom logic or we just use it as a Dto/type
@Embeddable
data class WorkspaceTitle(
    val value: String
) {
    init {
        require(value.isNotBlank()) { "Workspace title must not be blank." }
        require(value.length <= 100) { "Workspace title must not exceed 100 characters." }
    }

    override fun toString(): String = value
}