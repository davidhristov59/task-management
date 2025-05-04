package mk.ukim.finki.soa.backend.service

import mk.ukim.finki.soa.backend.model.*
import java.util.concurrent.CompletableFuture

interface WorkspaceModificationService {
    fun createWorkspace(command: CreateWorkspaceCommand): CompletableFuture<WorkspaceId>
    fun updateWorkspace(command: UpdateWorkspaceCommand): CompletableFuture<WorkspaceId>
    fun deleteWorkspace(command: DeleteWorkspaceCommand): CompletableFuture<WorkspaceId>
}

interface WorkspaceViewReadService {
    fun findById(workspaceId: WorkspaceId): WorkspaceView
    fun findAll(): List<WorkspaceView>
    fun findAllFilter(workspaceId: WorkspaceId?, ownerId: String?, memberId: String?, archived: Boolean?): List<WorkspaceView>
}