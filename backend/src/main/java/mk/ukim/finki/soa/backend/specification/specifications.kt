package mk.ukim.finki.soa.backend.specification

import mk.ukim.finki.soa.backend.model.*
import org.springframework.data.jpa.domain.Specification
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.CriteriaQuery
import jakarta.persistence.criteria.Root

object WorkspaceSpecifications {

    fun hasOwnerId(ownerId: String?): Specification<WorkspaceView>? {
        return if (ownerId == null) null
        else Specification { root: Root<WorkspaceView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<String>("ownerId"), ownerId)
        }
    }

    fun hasMemberId(memberId: String?): Specification<WorkspaceView>? {
        return if (memberId == null) null
        else Specification { root: Root<WorkspaceView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.like(root.get<String>("memberIds"), "%$memberId%")
        }
    }

    fun isArchived(archived: Boolean?): Specification<WorkspaceView>? {
        return if (archived == null) null
        else Specification { root: Root<WorkspaceView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<Boolean>("archived"), archived)
        }
    }

    fun isNotDeleted(): Specification<WorkspaceView> {
        return Specification { root: Root<WorkspaceView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<Boolean>("deleted"), false)
        }
    }
}

object ProjectSpecifications {

    fun hasWorkspaceId(workspaceId: WorkspaceId?): Specification<ProjectView>? {
        return if (workspaceId == null) null
        else Specification { root: Root<ProjectView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<WorkspaceId>("workspaceId"), workspaceId)
        }
    }

    fun hasOwnerId(ownerId: String?): Specification<ProjectView>? {
        return if (ownerId == null) null
        else Specification { root: Root<ProjectView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<String>("ownerId"), ownerId)
        }
    }

    fun hasStatus(status: ProjectStatus?): Specification<ProjectView>? {
        return if (status == null) null
        else Specification { root: Root<ProjectView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<ProjectStatus>("status"), status)
        }
    }

    fun isArchived(archived: Boolean?): Specification<ProjectView>? {
        return if (archived == null) null
        else Specification { root: Root<ProjectView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<Boolean>("archived"), archived)
        }
    }

    fun isNotDeleted(): Specification<ProjectView> {
        return Specification { root: Root<ProjectView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<Boolean>("deleted"), false)
        }
    }
}

object TaskSpecifications {

    fun hasProjectId(projectId: ProjectId?): Specification<TaskView>? {
        return if (projectId == null) null
        else Specification { root: Root<TaskView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<ProjectId>("projectId"), projectId)
        }
    }

    fun hasWorkspaceId(workspaceId: WorkspaceId?): Specification<TaskView>? {
        return if (workspaceId == null) null
        else Specification { root: Root<TaskView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<WorkspaceId>("workspaceId"), workspaceId)
        }
    }

    fun hasAssignedUserId(assignedUserId: String?): Specification<TaskView>? {
        return if (assignedUserId == null) null
        else Specification { root: Root<TaskView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<String>("assignedUserId"), assignedUserId)
        }
    }

    fun hasStatus(status: TaskStatus?): Specification<TaskView>? {
        return if (status == null) null
        else Specification { root: Root<TaskView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<TaskStatus>("status"), status)
        }
    }

    fun hasPriority(priority: TaskPriority?): Specification<TaskView>? {
        return if (priority == null) null
        else Specification { root: Root<TaskView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<TaskPriority>("priority"), priority)
        }
    }

    fun isNotDeleted(): Specification<TaskView> {
        return Specification { root: Root<TaskView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<Boolean>("deleted"), false)
        }
    }
}

object UserSpecifications {

    fun hasRole(role: UserRole?): Specification<UserView>? {
        return if (role == null) null
        else Specification { root: Root<UserView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<UserRole>("role"), role)
        }
    }

    fun isActive(active: Boolean?): Specification<UserView>? {
        return if (active == null) null
        else Specification { root: Root<UserView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<Boolean>("active"), active)
        }
    }

    fun hasEmail(email: String?): Specification<UserView>? {
        return if (email == null) null
        else Specification { root: Root<UserView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<String>("email"), email)
        }
    }

    fun nameContains(name: String?): Specification<UserView>? {
        return if (name == null) null
        else Specification { root: Root<UserView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.like(cb.lower(root.get<String>("name")), "%${name.lowercase()}%")
        }
    }

    fun isNotDeleted(): Specification<UserView> {
        return Specification { root: Root<UserView>, query: CriteriaQuery<*>, cb: CriteriaBuilder ->
            cb.equal(root.get<Boolean>("deleted"), false)
        }
    }
}
