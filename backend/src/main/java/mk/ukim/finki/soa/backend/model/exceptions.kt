package mk.ukim.finki.soa.backend.model

class WorkspaceNotFoundException(workspaceId: WorkspaceId) :
    RuntimeException("Workspace with id $workspaceId not found") {
}
