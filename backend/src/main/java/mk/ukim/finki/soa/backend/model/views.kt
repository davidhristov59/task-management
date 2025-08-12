package mk.ukim.finki.soa.backend.model

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDateTime

@Table(name = "workspace_view")
data class WorkspaceView(
    @Id
    @Column(name = "id")
    var workspaceId: WorkspaceId = WorkspaceId(),

    @Column(name = "title", nullable = false)
    var title: String = "",

    @Column(name = "description", nullable = true)
    var description: String? = null,

    @Column(name = "owner_id", nullable = false)
    var ownerId: String = "",

    @Column(name = "member_ids")
    var memberIds: String = "",

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "last_modified_at")
    var lastModifiedAt: Instant? = null,

    @Column(name = "archived", nullable = false)
    var archived: Boolean = false,

    @Column(name = "deleted", nullable = false)
    var deleted: Boolean = false
) {
    fun getMemberIdsList(): Set<String> {
        return if (memberIds.isBlank()) emptySet()
        else memberIds.split(",").map { it.trim() }.toSet()
    }
}

@Table(name = "project_view")
data class ProjectView(
    @Id
    @Column(name = "id")
    var projectId: ProjectId = ProjectId(""),

    @Column(name = "title", nullable = false)
    var title: String = "",

    @Column(name = "description", nullable = false)
    var description: String = "",

    @Column(name = "workspace_id", nullable = false)
    var workspaceId: WorkspaceId = WorkspaceId(),

    @Column(name = "owner_id", nullable = false)
    var ownerId: String = "",

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: ProjectStatus = ProjectStatus.PLANNING,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "last_modified_at")
    var lastModifiedAt: Instant? = null,

    @Column(name = "archived", nullable = false)
    var archived: Boolean = false,

    @Column(name = "deleted", nullable = false)
    var deleted: Boolean = false
)

@Table(name = "task_view")
data class TaskView(
    @Id
    @Column(name = "id")
    var taskId: TaskId = TaskId(""),

    @Column(name = "title", nullable = false)
    var title: String = "",

    @Column(name = "description", nullable = false)
    var description: String = "",

    @Column(name = "workspace_id", nullable = false)
    var workspaceId: WorkspaceId = WorkspaceId(),

    @Column(name = "project_id", nullable = false)
    var projectId: ProjectId = ProjectId(""),

    @Column(name = "assigned_user_id")
    var assignedUserId: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: TaskStatus = TaskStatus.PENDING,

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    var priority: TaskPriority = TaskPriority.MEDIUM,

    @Column(name = "deadline")
    var deadline: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "last_modified_at")
    var lastModifiedAt: Instant? = null,

    @Column(name = "tags", length = 1000)
    var tags: String = "[]",

    @Column(name = "categories", length = 1000)
    var categories: String = "[]",

    @Column(name = "attachments", length = 2000)
    var attachments: String = "[]",

    @Column(name = "comments", length = 4000)
    var comments: String = "[]",

    @Column(name = "deleted", nullable = false)
    var deleted: Boolean = false
)

@Table(name = "user_view")
data class UserView(
    @Id
    @Column(name = "id")
    var userId: UserId = UserId(""),

    @Column(name = "name", nullable = false)
    var name: String = "",

    @Column(name = "email", nullable = false)
    var email: String = "",

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    var role: UserRole = UserRole.STUDENT,

    @Column(name = "active", nullable = false)
    var active: Boolean = true,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "last_modified_at")
    var lastModifiedAt: Instant? = null,

    @Column(name = "deleted", nullable = false)
    var deleted: Boolean = false
)