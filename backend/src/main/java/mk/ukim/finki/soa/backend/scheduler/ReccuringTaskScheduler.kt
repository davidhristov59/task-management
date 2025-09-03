package mk.ukim.finki.soa.backend.scheduler

import com.fasterxml.jackson.databind.ObjectMapper
import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.repository.TaskViewRepository
import org.axonframework.commandhandling.gateway.CommandGateway
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDateTime
import java.util.UUID

@Component
class RecurringTaskScheduler(
    private val taskViewRepository: TaskViewRepository,
    private val commandGateway: CommandGateway,
    private val objectMapper: ObjectMapper
) {

    @Scheduled(fixedRate = 60000)
    fun generateRecurringTasks() {
        val recurringTasks = taskViewRepository.findByRecurrenceRuleIsNotNullAndDeletedIsFalse()

        for (task in recurringTasks) {
            val recurrenceRule = objectMapper.readValue(task.recurrenceRule, RecurrenceRule::class.java)

            val nextOccurrence = calculateNextOccurrence(task.deadline, recurrenceRule)

            if (nextOccurrence != null && nextOccurrence.isBefore(LocalDateTime.now().plusHours(1))) {
                if (recurrenceRule.endDate != null && nextOccurrence.isAfter(recurrenceRule.endDate)) {
                    continue // Do not create a new task, as the recurrence has ended
                }

                val newTaskId = TaskId(UUID.randomUUID().toString())
                val createTaskCommand = CreateTaskCommand(
                    taskId = newTaskId,
                    title = TaskTitle(task.title),
                    description = TaskDescription(task.description),
                    workspaceId = task.workspaceId,
                    projectId = task.projectId,
                    priority = task.priority,
                    deadline = Deadline(nextOccurrence),
                    recurrenceRule = recurrenceRule,
                    tags = objectMapper.readValue(task.tags, object : com.fasterxml.jackson.core.type.TypeReference<List<Tag>>() {}),
                    categories = objectMapper.readValue(task.categories, object : com.fasterxml.jackson.core.type.TypeReference<List<Category>>() {})
                )
                commandGateway.send<Any>(createTaskCommand)
            }
        }
    }

    private fun calculateNextOccurrence(
        lastDeadline: LocalDateTime?,
        rule: RecurrenceRule
    ): LocalDateTime? {
        val baseDate = lastDeadline ?: LocalDateTime.now()
        val interval = rule.interval

        return when (rule.type) {
            RecurrenceType.DAILY -> baseDate.plusDays(interval.toLong())
            RecurrenceType.WEEKLY -> baseDate.plusWeeks(interval.toLong())
            RecurrenceType.MONTHLY -> baseDate.plusMonths(interval.toLong())
        }
    }
}