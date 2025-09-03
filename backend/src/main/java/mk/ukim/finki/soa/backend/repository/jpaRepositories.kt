package mk.ukim.finki.soa.backend.repository

import mk.ukim.finki.soa.backend.model.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface WorkspaceViewRepository : JpaRepository<WorkspaceView, WorkspaceId>, JpaSpecificationExecutor<WorkspaceView> {
    fun findByOwnerId(@Param("ownerId") ownerId: String): List<WorkspaceView>
}

@Repository
interface ProjectViewRepository : JpaRepository<ProjectView, ProjectId>, JpaSpecificationExecutor<ProjectView> {
    fun findByWorkspaceId(workspaceId: WorkspaceId): List<ProjectView>
}

@Repository
interface TaskViewRepository : JpaRepository<TaskView, TaskId>, JpaSpecificationExecutor<TaskView> {
    fun findByProjectId(projectId: ProjectId): List<TaskView>
    fun findByRecurrenceRuleIsNotNullAndDeletedIsFalse(): List<TaskView>
}

@Repository
interface UserViewRepository : JpaRepository<UserView, UserId>, JpaSpecificationExecutor<UserView> {
    fun findByEmail(@Param("email") email: String): UserView?

    fun existsByEmail(email: String): Boolean
}