package mk.ukim.finki.soa.backend.service

import mk.ukim.finki.soa.backend.model.CreateWorkspaceCommand
import mk.ukim.finki.soa.backend.model.WorkspaceId
import mk.ukim.finki.soa.backend.model.WorkspaceView
import java.util.concurrent.CompletableFuture

interface WorkspaceModificationService {
    fun createWorkspace(command: CreateWorkspaceCommand): CompletableFuture<WorkspaceId>
}

interface WorkspaceViewReadService {
    fun findById(workspaceId: WorkspaceId): WorkspaceView
    fun findAll(): List<WorkspaceView>
}