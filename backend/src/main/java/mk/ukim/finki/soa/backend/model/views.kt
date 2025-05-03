package mk.ukim.finki.soa.backend.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table
data class WorkspaceView(
    @Id
    @Column(name = "id")
    var workspaceId: WorkspaceId = WorkspaceId(),  // Provide default values

    @Column(name = "title", nullable = false)
    var title: String = "",

    @Column(name = "owner_id", nullable = false)
    var ownerId: String = "",

    @ElementCollection
    @CollectionTable(name = "workspace_members", joinColumns = [JoinColumn(name = "workspace_id")])
    @Column(name = "member_id")
    var memberIds: MutableSet<String> = mutableSetOf(),

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "last_modified_at")
    var lastModifiedAt: Instant? = null,

    @Column(name = "archived", nullable = false)
    var archived: Boolean = false
)
