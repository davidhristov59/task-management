package mk.ukim.finki.soa.backend.service.impl

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.repository.TaskViewRepository
import mk.ukim.finki.soa.backend.specification.TaskSpecifications
import org.axonframework.queryhandling.QueryHandler
import org.springframework.stereotype.Service

@Service
class TaskViewReadService(private val taskViewRepository: TaskViewRepository) {

    @QueryHandler(queryName = "findTasksByProjectId")
    fun findTasksByProjectId(query: FindTasksQuery): List<TaskView> {
        val specs = listOfNotNull(
            TaskSpecifications.hasProjectId(query.projectId),
            TaskSpecifications.hasAssignedUserId(query.assignedUserId),
            TaskSpecifications.hasStatus(query.status),
            TaskSpecifications.hasPriority(query.priority),
            TaskSpecifications.isNotDeleted()
        )

        return if (specs.isEmpty()) {
            taskViewRepository.findAll()
        } else {
            val combinedSpec = specs.reduce { acc, spec -> acc.and(spec) }
            taskViewRepository.findAll(combinedSpec)
        }
    }

    @QueryHandler(queryName = "findTaskById")
    fun findTaskById(taskId: TaskId): TaskView {
        return taskViewRepository.findById(taskId)
            .filter { !it.deleted }
            .orElseThrow { NoSuchElementException("Task not found: $taskId") }
    }

    @QueryHandler(queryName = "findRecurringTasks")
    fun findRecurringTasks(): List<TaskView> {
        return taskViewRepository.findByRecurrenceRuleIsNotNullAndDeletedIsFalse()
    }
}