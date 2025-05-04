package mk.ukim.finki.soa.backend.service.impl

import mk.ukim.finki.soa.backend.model.WorkspaceId
import mk.ukim.finki.soa.backend.model.WorkspaceNotFoundException
import mk.ukim.finki.soa.backend.model.WorkspaceView
import mk.ukim.finki.soa.backend.repository.WorkspaceViewJpaRepository
import mk.ukim.finki.soa.backend.service.WorkspaceViewReadService
import org.springframework.stereotype.Service

@Service
class WorkspaceViewReadServiceImpl(
    val workspaceViewJpaRepository: WorkspaceViewJpaRepository,
) : WorkspaceViewReadService {
    override fun findById(workspaceId: WorkspaceId): WorkspaceView {
        return workspaceViewJpaRepository.findById(workspaceId).orElseThrow { WorkspaceNotFoundException(workspaceId) }
    }

    override fun findAll(): List<WorkspaceView> {
        return workspaceViewJpaRepository.findAll()
    }

    override fun findAllFilter(
        workspaceId: WorkspaceId?,
        ownerId: String?,
        memberId: String?,
        archived: Boolean?
    ): List<WorkspaceView> {
        if (workspaceId != null) {
            this.findById(workspaceId);
        }

        if (ownerId != null && memberId != null && archived != null) {
            return workspaceViewJpaRepository.findByMemberIdsContainingAndOwnerIdAndArchived(memberId, ownerId, archived);
        }

        if (ownerId != null && memberId != null) {
            return workspaceViewJpaRepository.findByMemberIdsContainingAndOwnerId(memberId, ownerId);
        }

        if (ownerId != null && archived != null) {
            return workspaceViewJpaRepository.findByOwnerIdAndArchived(ownerId, archived);
        }

        if (memberId != null && archived != null) {
            return workspaceViewJpaRepository.findByMemberIdsContainingAndArchived(memberId, archived);
        }

        if (ownerId != null) {
            return workspaceViewJpaRepository.findByOwnerId(ownerId);
        }

        if (memberId != null) {
            return workspaceViewJpaRepository.findByMemberIdsContaining(memberId);
        }

        if (archived != null) {
            return workspaceViewJpaRepository.findByArchived(archived);
        }

        return workspaceViewJpaRepository.findAll();
    }
}