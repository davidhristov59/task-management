package mk.ukim.finki.soa.backend.repository

import mk.ukim.finki.soa.backend.model.WorkspaceId
import mk.ukim.finki.soa.backend.model.WorkspaceView
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WorkspaceViewJpaRepository : JpaRepository<WorkspaceView, WorkspaceId> {
    // TODO: This is currently covered by findById, but this is how we will append custom functionalities that also need to be added to the service
    fun findByWorkspaceId(workspaceId: WorkspaceId): List<WorkspaceView>
    fun findByOwnerId(ownerId: String): List<WorkspaceView>
    fun findByMemberIdsContaining(memberId: String): List<WorkspaceView>
    fun findByArchivedFalse(): List<WorkspaceView>
}