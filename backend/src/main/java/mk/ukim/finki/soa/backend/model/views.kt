package mk.ukim.finki.soa.backend.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "workspace_view")
data class WorkspaceView(
    @Id
    @Column(name = "id")
    val workspaceId: WorkspaceId,

    @Column(name = "title", nullable = false)
    var title: String,

    @Column(name = "owner_id", nullable = false)
    val ownerId: String,

    @ElementCollection
    @CollectionTable(name = "workspace_members", joinColumns = [JoinColumn(name = "workspace_id")])
    @Column(name = "member_id")
    val memberIds: MutableSet<String> = mutableSetOf(),

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant,

    @Column(name = "last_modified_at")
    var lastModifiedAt: Instant? = null,

    @Column(name = "archived", nullable = false)
    var archived: Boolean = false
)