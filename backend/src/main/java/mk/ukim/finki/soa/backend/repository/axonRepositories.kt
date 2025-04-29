package mk.ukim.finki.soa.backend.repository

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import mk.ukim.finki.soa.backend.model.Workspace
import mk.ukim.finki.soa.backend.model.WorkspaceId
import org.axonframework.common.jpa.SimpleEntityManagerProvider
import org.axonframework.eventhandling.EventBus
import org.axonframework.messaging.annotation.ParameterResolverFactory
import org.axonframework.modelling.command.GenericJpaRepository
import org.axonframework.modelling.command.Repository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import kotlin.jvm.java

@Configuration("taskManagementRepositoriesConfiguration")
open class AxonRepositoriesConfiguration(@PersistenceContext val entityManager: EntityManager) {
    @Bean("axonWorkspaceRepository")
    open fun workspaceGenericJpaRepository(
        eventBus: EventBus,
        parameterResolverFactory: ParameterResolverFactory
    ): Repository<Workspace> {
        return GenericJpaRepository.builder(Workspace::class.java)
            .entityManagerProvider(SimpleEntityManagerProvider(entityManager))
            .parameterResolverFactory(parameterResolverFactory)
            .eventBus(eventBus)
            .identifierConverter { WorkspaceId(it) }
            .build()
    }
}