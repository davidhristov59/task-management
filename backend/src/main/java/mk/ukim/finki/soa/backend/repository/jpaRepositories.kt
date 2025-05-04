package mk.ukim.finki.soa.backend.repository

import mk.ukim.finki.soa.backend.model.WorkspaceId
import mk.ukim.finki.soa.backend.model.WorkspaceView
import org.springframework.data.jpa.repository.JpaRepository
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