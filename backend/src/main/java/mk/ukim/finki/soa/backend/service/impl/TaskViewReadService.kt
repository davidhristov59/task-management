package mk.ukim.finki.soa.backend.service.impl

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.repository.TaskViewJpaRepository
import org.axonframework.queryhandling.QueryHandler
import org.springframework.stereotype.Service

@Service
class TaskViewReadService(private val taskViewRepository: TaskViewJpaRepository) {

    @QueryHandler(queryName = "findTasksByProjectId")
    fun findTasksByProjectId(query: FindTasksQuery): List<TaskView> {
        return when {
            query.status != null && query.priority != null && query.assignedUserId != null -> {
                taskViewRepository.findAll()
                    .filter {
                        !it.deleted &&
                        it.projectId == query.projectId &&
                        it.status == query.status &&
                        it.priority == query.priority &&
                        it.assignedUserId == query.assignedUserId
                    }
            }
            query.status != null && query.priority != null -> {
                taskViewRepository.findAll()
                    .filter {
                        !it.deleted &&
                        it.projectId == query.projectId &&
                        it.status == query.status &&
                        it.priority == query.priority
                    }
            }
            query.status != null && query.assignedUserId != null -> {
                taskViewRepository.findAll()
                    .filter {
                        !it.deleted &&
                        it.projectId == query.projectId &&
                        it.status == query.status &&
                        it.assignedUserId == query.assignedUserId
                    }
            }
            query.priority != null && query.assignedUserId != null -> {
                taskViewRepository.findAll()
                    .filter {
                        !it.deleted &&
                        it.projectId == query.projectId &&
                        it.priority == query.priority &&
                        it.assignedUserId == query.assignedUserId
                    }
            }
            query.status != null -> {
                taskViewRepository.findByProjectIdAndStatus(query.projectId, query.status)
                    .filter { !it.deleted }
            }
            query.priority != null -> {
                taskViewRepository.findByProjectIdAndPriority(query.projectId, query.priority)
                    .filter { !it.deleted }
            }
            query.assignedUserId != null -> {
                taskViewRepository.findByProjectIdAndAssignedUserId(query.projectId, query.assignedUserId)
                    .filter { !it.deleted }
            }
            else -> {
                taskViewRepository.findByProjectId(query.projectId)
                    .filter { !it.deleted }
            }
        }
    }

    @QueryHandler(queryName = "findTaskById")
    fun findTaskById(taskId: TaskId): TaskView {
        return taskViewRepository.findById(taskId)
            .filter { !it.deleted }
            .orElseThrow { NoSuchElementException("Task not found: $taskId") }
    }
}
