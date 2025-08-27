package mk.ukim.finki.soa.backend.service

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.repository.*
import mk.ukim.finki.soa.backend.specification.*
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.eventhandling.EventHandler
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
open class WorkspaceIntegrationService(
    private val workspaceViewRepository: WorkspaceViewRepository,
    private val commandGateway: CommandGateway,
    private val projectIntegrationService: ProjectIntegrationService
) {

    @EventHandler
    fun handleUserDeactivated(event: UserDeactivatedEvent) {
        println("Processing user deactivated event for workspaces: ${event.userId}")

        // Find workspaces owned by this user and reassign them
        val ownedWorkspaces = findWorkspacesByOwner(event.userId.value)

        ownedWorkspaces.forEach { workspace ->
            // Remove user from member list if present
            val command = RemoveMemberFromWorkspaceCommand(workspace.workspaceId, event.userId.value)
            commandGateway.send<Any>(command)

            // If user is the owner, reassign ownership
            if (workspace.ownerId == event.userId.value) {
                reassignWorkspaceOwnership(workspace)
            }
        }
    }

    // Note: This would need a proper OrganizationPolicyChangedEvent to be defined
    // For now, commenting out to avoid compilation issues
    /*
    @EventHandler
    fun handleOrganizationPolicyChanged(event: OrganizationPolicyChangedEvent) {
        println("Processing organization policy change: ${event.policyType} = ${event.newValue}")

        when (event.policyType) {
            "MAX_WORKSPACE_MEMBERS" -> {
                enforceMaxMembersPolicy(event.newValue as Int)
            }
            "WORKSPACE_RETENTION_DAYS" -> {
                enforceRetentionPolicy(event.newValue as Int)
            }
            "REQUIRE_WORKSPACE_APPROVAL" -> {
                if (event.newValue as Boolean) {
                    archiveUnapprovedWorkspaces()
                }
            }
        }
    }
    */

    // Note: This would need a proper UserInviteAcceptedEvent to be defined
    // For now, commenting out to avoid compilation issues
    /*
    @EventHandler
    fun handleUserInviteAccepted(event: UserInviteAcceptedEvent) {
        println("Processing user invite accepted: ${event.userId} joined workspace ${event.workspaceId}")

        // Add user to workspace
        val command = AddMemberToWorkspaceCommand(event.workspaceId, event.userId)
        commandGateway.send<Any>(command)
            .thenRun {
                println("Successfully added user ${event.userId} to workspace ${event.workspaceId}")
                // Could trigger welcome notifications or setup default permissions
            }
    }
    */

    // Note: This would need a proper WorkspaceUsageLimitExceededEvent to be defined
    // For now, commenting out to avoid compilation issues
    /*
    @EventHandler
    fun handleWorkspaceUsageLimitExceeded(event: WorkspaceUsageLimitExceededEvent) {
        println("Workspace usage limit exceeded: ${event.workspaceId} - ${event.limitType}: ${event.currentValue}/${event.maxValue}")

        when (event.limitType) {
            "PROJECTS" -> {
                // Archive oldest completed projects
                archiveOldestCompletedProjects(event.workspaceId, event.currentValue - event.maxValue)
            }
            "MEMBERS" -> {
                // Send notification to workspace owner
                notifyWorkspaceOwnerOfLimit(event.workspaceId.value, "Member limit exceeded")
            }
            "STORAGE" -> {
                // Clean up old attachments or notify owner
                cleanupWorkspaceStorage(event.workspaceId)
            }
        }
    }
    */

    // Note: This would need a proper WorkspaceInactivityDetectedEvent to be defined
    // For now, commenting out to avoid compilation issues
    /*
    @EventHandler
    fun handleWorkspaceInactivityDetected(event: WorkspaceInactivityDetectedEvent) {
        println("Workspace inactivity detected: ${event.workspaceId} inactive for ${event.inactiveDays} days")

        if (event.inactiveDays >= 90) {
            // Archive workspace due to long inactivity
            val command = ArchiveWorkspaceCommand(event.workspaceId)
            commandGateway.send<Any>(command)
        } else if (event.inactiveDays >= 30) {
            // Send reminder notification to workspace owner
            notifyWorkspaceOwnerOfInactivity(event.workspaceId.value, event.inactiveDays)
        }
    }
    */

    // Helper methods
    private fun findWorkspacesByOwner(ownerId: String): List<WorkspaceView> {
        val spec = WorkspaceSpecifications.hasOwnerId(ownerId)!!
            .and(WorkspaceSpecifications.isNotDeleted())
        return workspaceViewRepository.findAll(spec)
    }

    private fun reassignWorkspaceOwnership(workspace: WorkspaceView) {
        // Find the first active member to become the new owner
        val memberIds = workspace.getMemberIdsList()
        val newOwnerId = memberIds.firstOrNull() ?: "admin"

        val command = UpdateWorkspaceOwnerCommand(workspace.workspaceId, newOwnerId)
        commandGateway.send<Any>(command)
            .thenRun {
                println("Reassigned workspace ${workspace.workspaceId} ownership to $newOwnerId")
            }
    }

    private fun enforceMaxMembersPolicy(maxMembers: Int) {
        val allWorkspaces = workspaceViewRepository.findAll(WorkspaceSpecifications.isNotDeleted())

        allWorkspaces.forEach { workspace ->
            val memberCount = workspace.getMemberIdsList().size
            if (memberCount > maxMembers) {
                println("Workspace ${workspace.workspaceId} exceeds member limit: $memberCount > $maxMembers")
                // Could remove newest members or notify owner
            }
        }
    }

    private fun enforceRetentionPolicy(retentionDays: Int) {
        // This would need to be implemented based on your retention requirements
        println("Enforcing retention policy: $retentionDays days")
    }

    private fun archiveUnapprovedWorkspaces() {
        // Implementation would depend on how you track approval status
        println("Archiving unapproved workspaces")
    }

    private fun archiveOldestCompletedProjects(workspaceId: WorkspaceId, countToArchive: Int) {
        // This would be handled by ProjectIntegrationService
        projectIntegrationService.handleWorkspaceArchived(workspaceId.toString())
    }

    private fun notifyWorkspaceOwnerOfLimit(workspaceId: String, message: String) {
        println("Notifying workspace owner: $workspaceId - $message")
        // Implementation would integrate with notification service
    }

    private fun cleanupWorkspaceStorage(workspaceId: WorkspaceId) {
        println("Cleaning up storage for workspace: $workspaceId")
        // Implementation would clean up old attachments, files, etc.
    }

    private fun notifyWorkspaceOwnerOfInactivity(workspaceId: String, inactiveDays: Int) {
        println("Notifying workspace owner of inactivity: $workspaceId - $inactiveDays days")
        // Implementation would send notification
    }
}