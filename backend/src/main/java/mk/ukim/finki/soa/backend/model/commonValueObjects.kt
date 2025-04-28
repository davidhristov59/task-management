package mk.ukim.finki.soa.backend.model

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.MappedSuperclass
import java.io.Serializable
import java.math.BigDecimal
import java.time.ZonedDateTime

@MappedSuperclass
abstract class Identifier<T>(providedValue: String, @Transient val entityClass: Class<T>) : Serializable {

    val value = "${entityClass.simpleName}:${providedValue.replace(".*:".toRegex(), "")}"

    override fun hashCode(): Int {
        return this.entityClass.hashCode() + this.value.hashCode()
    }

    fun baseValue() = value.split(":")[1]

    fun prefixedValue() = value

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Identifier<*>

        if (entityClass != other.entityClass) return false
        if (value != other.value) return false

        return true
    }

    override fun toString(): String = value
}


interface LabeledEntity {

    @JsonProperty("id")
    fun getId(): Identifier<out Any>

    @JsonProperty("label")
    fun getLabel(): String

    @JsonProperty("entityType")
    fun getEntityType(): String = this.javaClass.simpleName

    @JsonProperty("dateCreated")
    fun dateCreated(): ZonedDateTime? = null

    @JsonProperty("archived")
    fun isArchived(): Boolean = false
}



