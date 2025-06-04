package mk.ukim.finki.soa.backend.service

import mk.ukim.finki.soa.backend.model.ProjectId
import mk.ukim.finki.soa.backend.model.ProjectView
import mk.ukim.finki.soa.backend.model.WorkspaceId
import mk.ukim.finki.soa.backend.repository.ProjectViewJpaRepository
import org.axonframework.queryhandling.QueryHandler
import org.springframework.stereotype.Service

@Service
class ProjectViewReadService(private val projectViewRepository: ProjectViewJpaRepository) {

    @QueryHandler(queryName = "findProjectsByWorkspaceId")
    fun findProjectsByWorkspaceId(workspaceId: WorkspaceId): List<ProjectView> {
        return projectViewRepository.findByWorkspaceId(workspaceId)
            .filter { !it.deleted }
    }

    @QueryHandler(queryName = "findProjectById")
    fun findProjectById(projectId: ProjectId): ProjectView {
        return projectViewRepository.findById(projectId)
            .filter { !it.deleted }
            .orElseThrow { NoSuchElementException("Project not found: $projectId") }
    }
}
