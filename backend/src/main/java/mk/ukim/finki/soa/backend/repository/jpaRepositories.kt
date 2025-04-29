package mk.ukim.finki.soa.backend.repository

import mk.ukim.finki.soa.backend.model.WorkspaceId
import mk.ukim.finki.soa.backend.model.WorkspaceView
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WorkspaceViewJpaRepository : JpaRepository<WorkspaceView, WorkspaceId> {
    fun findByWorkspaceId(workspaceId: WorkspaceId): List<WorkspaceView>
}