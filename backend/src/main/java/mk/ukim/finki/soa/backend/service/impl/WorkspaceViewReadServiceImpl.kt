package mk.ukim.finki.soa.backend.service.impl

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.repository.WorkspaceViewRepository
import mk.ukim.finki.soa.backend.service.WorkspaceViewReadService
import mk.ukim.finki.soa.backend.specification.WorkspaceSpecifications
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service

@Service
class WorkspaceViewReadServiceImpl(
    private val workspaceViewRepository: WorkspaceViewRepository
) : WorkspaceViewReadService {

    override fun findById(workspaceId: WorkspaceId): WorkspaceView {
        val workspace = workspaceViewRepository.findById(workspaceId)
            .orElseThrow { WorkspaceNotFoundException(workspaceId) }
        
        if (workspace.deleted) {
            throw WorkspaceNotFoundException(workspaceId)
        }
        
        return workspace
    }

    override fun findAll(): List<WorkspaceView> {
        return workspaceViewRepository.findAll(WorkspaceSpecifications.isNotDeleted())
    }

    override fun findAllFilter(
        workspaceId: WorkspaceId?,
        ownerId: String?,
        memberId: String?,
        archived: Boolean?
    ): List<WorkspaceView> {
        if (workspaceId != null) {
            return try {
                listOf(findById(workspaceId))
            } catch (e: WorkspaceNotFoundException) {
                emptyList()
            }
        }

        val specs = listOfNotNull(
            WorkspaceSpecifications.hasOwnerId(ownerId),
            WorkspaceSpecifications.hasMemberId(memberId),
            WorkspaceSpecifications.isArchived(archived),
            WorkspaceSpecifications.isNotDeleted()
        )

        return if (specs.isEmpty()) {
            workspaceViewRepository.findAll(WorkspaceSpecifications.isNotDeleted())
        } else {
            val combinedSpec = specs.reduce { acc, spec -> acc.and(spec) }
            workspaceViewRepository.findAll(combinedSpec)
        }
    }
}
