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
    fun handleUserDeactivated(userId: String) {
        println("Processing user deactivated event for workspaces: $userId")

        // Find workspaces owned by this user and reassign them
        val ownedWorkspaces = findWorkspacesByOwner(userId)

        ownedWorkspaces.forEach { workspace ->
            // Remove user from member list if present
            val command = RemoveMemberFromWorkspaceCommand(workspace.workspaceId, userId)
            commandGateway.send<Any>(command)

            // If user is the owner, reassign ownership
            if (workspace.ownerId == userId) {
                reassignWorkspaceOwnership(workspace)
            }
        }
    }

    @EventHandler
    fun handleOrganizationPolicyChanged(policyType: String, newValue: Any) {
        println("Processing organization policy change: $policyType = $newValue")

        when (policyType) {
            "MAX_WORKSPACE_MEMBERS" -> {
                enforceMaxMembersPolicy(newValue as Int)
            }
            "WORKSPACE_RETENTION_DAYS" -> {
                enforceRetentionPolicy(newValue as Int)
            }
            "REQUIRE_WORKSPACE_APPROVAL" -> {
                if (newValue as Boolean) {
                    archiveUnapprovedWorkspaces()
                }
            }
        }
    }

    @EventHandler
    fun handleUserInviteAccepted(userId: String, workspaceId: String) {
        println("Processing user invite accepted: $userId joined workspace $workspaceId")

        // Add user to workspace
        val command = AddMemberToWorkspaceCommand(WorkspaceId(workspaceId), userId)
        commandGateway.send<Any>(command)
            .thenRun {
                println("Successfully added user $userId to workspace $workspaceId")
                // Could trigger welcome notifications or setup default permissions
            }
    }

    @EventHandler
    fun handleWorkspaceUsageLimitExceeded(workspaceId: String, limitType: String, currentValue: Int, maxValue: Int) {
        println("Workspace usage limit exceeded: $workspaceId - $limitType: $currentValue/$maxValue")

        when (limitType) {
            "PROJECTS" -> {
                // Archive oldest completed projects
                archiveOldestCompletedProjects(WorkspaceId(workspaceId), currentValue - maxValue)
            }
            "MEMBERS" -> {
                // Send notification to workspace owner
                notifyWorkspaceOwnerOfLimit(workspaceId, "Member limit exceeded")
            }
            "STORAGE" -> {
                // Clean up old attachments or notify owner
                cleanupWorkspaceStorage(WorkspaceId(workspaceId))
            }
        }
    }

    @EventHandler
    fun handleWorkspaceInactivityDetected(workspaceId: String, inactiveDays: Int) {
        println("Workspace inactivity detected: $workspaceId inactive for $inactiveDays days")

        if (inactiveDays >= 90) {
            // Archive workspace due to long inactivity
            val command = ArchiveWorkspaceCommand(WorkspaceId(workspaceId))
            commandGateway.send<Any>(command)
        } else if (inactiveDays >= 30) {
            // Send reminder notification to workspace owner
            notifyWorkspaceOwnerOfInactivity(workspaceId, inactiveDays)
        }
    }

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