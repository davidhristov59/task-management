package mk.ukim.finki.soa.backend.service

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.repository.ProjectViewRepository
import mk.ukim.finki.soa.backend.specification.ProjectSpecifications
import org.axonframework.queryhandling.QueryHandler
import org.springframework.stereotype.Service

@Service
class ProjectViewReadService(private val projectViewRepository: ProjectViewRepository) {

    @QueryHandler(queryName = "findProjectsByWorkspaceId")
    fun findProjectsByWorkspaceId(workspaceId: WorkspaceId): List<ProjectView> {
        val specs = listOf(
            ProjectSpecifications.hasWorkspaceId(workspaceId),
            ProjectSpecifications.isNotDeleted()
        )
        val combinedSpec = specs.reduce { acc, spec -> acc?.and(spec) }
        return projectViewRepository.findAll(combinedSpec)
    }

    @QueryHandler(queryName = "findProjectById")
    fun findProjectById(projectId: ProjectId): ProjectView {
        return projectViewRepository.findById(projectId)
            .filter { !it.deleted }
            .orElseThrow { NoSuchElementException("Project not found: $projectId") }
    }

    // Additional method for filtering projects
    fun findProjectsWithFilters(
        workspaceId: WorkspaceId? = null,
        ownerId: String? = null,
        status: ProjectStatus? = null,
        archived: Boolean? = null
    ): List<ProjectView> {
        val specs = listOfNotNull(
            ProjectSpecifications.hasWorkspaceId(workspaceId),
            ProjectSpecifications.hasOwnerId(ownerId),
            ProjectSpecifications.hasStatus(status),
            ProjectSpecifications.isArchived(archived),
            ProjectSpecifications.isNotDeleted()
        )

        return if (specs.isEmpty()) {
            projectViewRepository.findAll()
        } else {
            val combinedSpec = specs.reduce { acc, spec -> acc.and(spec) }
            projectViewRepository.findAll(combinedSpec)
        }
    }
}