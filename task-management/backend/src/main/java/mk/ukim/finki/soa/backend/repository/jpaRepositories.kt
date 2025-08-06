package mk.ukim.finki.soa.backend.repository

import mk.ukim.finki.soa.backend.model.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface WorkspaceViewJpaRepository : JpaRepository<WorkspaceView, WorkspaceId> {
    fun findByOwnerId(ownerId: String): List<WorkspaceView>
    fun findByMemberIdsContaining(memberId: String): List<WorkspaceView>
    fun findByArchived(archived: Boolean): List<WorkspaceView>
    fun findByOwnerIdAndArchived(ownerId: String, archived: Boolean): List<WorkspaceView>
    fun findByMemberIdsContainingAndArchived(memberId: String, archived: Boolean): List<WorkspaceView>
    fun findByMemberIdsContainingAndOwnerId(memberId: String, ownerId: String): List<WorkspaceView>
    fun findByMemberIdsContainingAndOwnerIdAndArchived(memberId: String?, ownerId: String?, archived: Boolean?): List<WorkspaceView>
}

@Repository
interface ProjectViewJpaRepository : JpaRepository<ProjectView, ProjectId> {
    fun findByWorkspaceId(workspaceId: WorkspaceId): List<ProjectView>
    fun findByOwnerId(ownerId: String): List<ProjectView>
    fun findByStatus(status: ProjectStatus): List<ProjectView>
    fun findByWorkspaceIdAndStatus(workspaceId: WorkspaceId, status: ProjectStatus): List<ProjectView>
    fun findByWorkspaceIdAndArchived(workspaceId: WorkspaceId, archived: Boolean): List<ProjectView>
}

@Repository
interface TaskViewJpaRepository : JpaRepository<TaskView, TaskId> {
    fun findByProjectId(projectId: ProjectId): List<TaskView>
    fun findByWorkspaceId(workspaceId: WorkspaceId): List<TaskView>
    fun findByAssignedUserId(assignedUserId: String): List<TaskView>
    fun findByStatus(status: TaskStatus): List<TaskView>
    fun findByPriority(priority: TaskPriority): List<TaskView>
    fun findByProjectIdAndStatus(projectId: ProjectId, status: TaskStatus): List<TaskView>
    fun findByProjectIdAndPriority(projectId: ProjectId, priority: TaskPriority): List<TaskView>
    fun findByProjectIdAndAssignedUserId(projectId: ProjectId, assignedUserId: String): List<TaskView>
}

@Repository
interface UserViewJpaRepository : JpaRepository<UserView, UserId> {
    fun findByUserId(userId: UserId): List<UserView>
    fun findByRole(role: UserRole): List<UserView>
    fun findByActive(active: Boolean): List<UserView>

    @Query("SELECT u FROM UserView u WHERE u.email = :email")
    fun findByEmailString(@Param("email") email: String): UserView?
    fun findByEmail(email: UserEmail): UserView?
    fun findByNameContainingIgnoreCase(name: String): List<UserView>
    fun findByRoleAndActive(role: UserRole, active: Boolean): List<UserView>
    fun existsByEmail(email: String): Boolean
    fun existsByEmailAndActiveTrue(email: String): Boolean
    fun findByDeleted(deleted: Boolean): List<UserView>
    fun findByActiveAndDeleted(active: Boolean, deleted: Boolean): List<UserView>
}