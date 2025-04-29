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


}