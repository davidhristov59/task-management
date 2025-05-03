package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.model.WorkspaceId
import mk.ukim.finki.soa.backend.model.WorkspaceView
import mk.ukim.finki.soa.backend.repository.WorkspaceViewJpaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/workspaces")
class WorkspaceRestApi(private val repository: WorkspaceViewJpaRepository) {

    @GetMapping
    fun findAll(): List<WorkspaceView> {
        return repository.findAll()
    }

    @GetMapping("/active")
    fun findActive(): List<WorkspaceView> {
        return repository.findByArchivedFalse()
    }

    @GetMapping("/{id}")
    fun findById(@PathVariable id: String): ResponseEntity<WorkspaceView> {
        val workspaceId = WorkspaceId(id) // Assuming WorkspaceId has a constructor that accepts a String
        val workspace = repository.findById(workspaceId)
        return if (workspace.isPresent) {
            ResponseEntity.ok(workspace.get())
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/owner/{ownerId}")
    fun findByOwner(@PathVariable ownerId: String): List<WorkspaceView> {
        return repository.findByOwnerId(ownerId)
    }

    @GetMapping("/member/{memberId}")
    fun findByMember(@PathVariable memberId: String): List<WorkspaceView> {
        return repository.findByMemberIdsContaining(memberId)
    }
}