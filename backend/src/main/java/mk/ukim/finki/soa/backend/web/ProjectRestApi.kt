package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.model.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.concurrent.CompletableFuture
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.messaging.responsetypes.ResponseTypes
import org.axonframework.queryhandling.QueryGateway
import java.util.*

@RestController
@RequestMapping("/workspaces/{workspaceId}/projects")
class ProjectRestApi(
    private val commandGateway: CommandGateway,
    private val queryGateway: QueryGateway
) {

    @GetMapping
    fun getProjects(@PathVariable workspaceId: String): CompletableFuture<List<ProjectView>> {
        return queryGateway.query(
            "findProjectsByWorkspaceId",
            WorkspaceId(workspaceId),
            ResponseTypes.multipleInstancesOf(ProjectView::class.java)
        )
    }

    @GetMapping("/{projectId}")
    fun getProject(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String
    ): CompletableFuture<ResponseEntity<ProjectView>> {
        return queryGateway.query(
            "findProjectById",
            ProjectId(projectId),
            ResponseTypes.instanceOf(ProjectView::class.java)
        )
        .thenApply { ResponseEntity.ok(it) }
        .exceptionally { ResponseEntity.notFound().build() }
    }

    @PostMapping
    fun createProject(
        @PathVariable workspaceId: String,
        @RequestBody request: CreateProjectRequest
    ): CompletableFuture<ResponseEntity<ProjectId>> {
        val projectId = ProjectId(UUID.randomUUID().toString())

        val command = CreateProjectCommand(
            projectId = projectId,
            title = ProjectTitle(request.title),
            description = ProjectDescription(request.description ?: ""),
            workspaceId = WorkspaceId(workspaceId),
            ownerId = request.ownerId
        )

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.status(HttpStatus.CREATED).body(projectId) }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PutMapping("/{projectId}")
    fun updateProject(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String,
        @RequestBody request: UpdateProjectRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        val command = UpdateProjectCommand(
            projectId = ProjectId(projectId),
            title = request.title?.let { ProjectTitle(it) },
            description = request.description?.let { ProjectDescription(it) },
            status = request.status,
            ownerId = request.ownerId,
            archived = request.archived
        )

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @DeleteMapping("/{projectId}")
    fun deleteProject(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        val command = DeleteProjectCommand(ProjectId(projectId))

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.noContent().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PostMapping("/{projectId}/archive")
    fun archiveProject(
        @PathVariable workspaceId: String,
        @PathVariable projectId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        val command = ArchiveProjectCommand(ProjectId(projectId))

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }
}

data class CreateProjectRequest(
    val title: String,
    val description: String? = null,
    val ownerId: String
)

data class UpdateProjectRequest(
    val title: String? = null,
    val description: String? = null,
    val status: ProjectStatus? = null,
    val ownerId: String? = null,
    val archived: Boolean? = null
)
