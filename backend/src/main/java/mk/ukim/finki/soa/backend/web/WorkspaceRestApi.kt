package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.model.WorkspaceView
import mk.ukim.finki.soa.backend.service.WorkspaceViewReadService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/workspaces")
class WorkspaceRestApi(val workspaceViewReadService: WorkspaceViewReadService) {
    @GetMapping("/all")
    fun findAll(): List<WorkspaceView> {
        return workspaceViewReadService.findAll()
    }
}