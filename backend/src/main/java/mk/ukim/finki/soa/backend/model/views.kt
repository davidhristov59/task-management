package mk.ukim.finki.soa.backend.model

import jakarta.persistence.*
import org.hibernate.annotations.Immutable

@Entity
@Table(name = "workspace")
@Immutable
data class ExpenseView(
    @EmbeddedId
    @AttributeOverride(name = "value", column = Column(name = "id"))
    val id: WorkspaceId,
    val title: String,
    val ownerId: String,
    val memberIds: MutableList<String> = mutableListOf()

// TODO: Add FK like column
//    @Embedded
//    @Column(name = "account_id", nullable = false)
//    val accountId: AccountId,

    ) : LabeledEntity {
    override fun getId(): Identifier<out Any> {
        return id
    }

    override fun getLabel(): String {
        return title
    }
}