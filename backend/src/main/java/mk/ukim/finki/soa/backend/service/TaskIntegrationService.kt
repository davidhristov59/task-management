package mk.ukim.finki.soa.backend.service
import org.springframework.stereotype.Service

@Service
class TaskIntegrationService {

    fun handleUserCreated(userId: String, userName: String) {
        println("Processing user created event: $userId - $userName")
        // Логика за да се ажурира листата на можни assignees
        // Можеби кеширање на user info, итн.
    }

    fun handleUserDeactivated(userId: String) {
        println("Processing user deactivated event: $userId")
        // Логика за да се reassign-ат сите задачи од овој корисник
        // Можеби преку command bus да се испратат ReassignTask команди
    }

    fun handleUserUpdated(userId: String, userData: Map<String, Any>) {
        println("Processing user updated event: $userId")
        // Ажурирање на локални податоци за корисникот
    }

    fun handleProjectCreated(projectId: String, projectName: String) {
        println("Processing project created event: $projectId - $projectName")
        // Можеби иницијализација на default tasks за проектот
    }

    fun handleProjectStatusChanged(projectId: String, newStatus: String) {
        println("Processing project status change: $projectId -> $newStatus")
        // Можеби ажурирање на статусот на сите задачи во проектот
    }

    fun handleProjectDeleted(projectId: String) {
        println("Processing project deleted event: $projectId")
        // Архивирање или бришење на сите задачи од проектот
    }

    fun handleNotificationDelivered(taskId: String?, userId: String) {
        println("Notification delivered for task: $taskId to user: $userId")
        // Можеби ажурирање на notification status
    }

    fun handleNotificationFailed(taskId: String?, userId: String, reason: String) {
        println("Notification failed for task: $taskId to user: $userId. Reason: $reason")
        // Можеби retry логика или алтернативни начини за известување
    }
}