package mk.ukim.finki.soa.backend.service.impl

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.repository.UserViewRepository
import mk.ukim.finki.soa.backend.specification.UserSpecifications
import org.axonframework.queryhandling.QueryHandler
import org.springframework.stereotype.Service

@Service
class UserViewReadService(private val userViewRepository: UserViewRepository) {

    @QueryHandler(queryName = "findUserById")
    fun findById(userId: UserId): UserView {
        return userViewRepository.findById(userId)
            .filter { !it.deleted }
            .orElseThrow { NoSuchElementException("User not found: $userId") }
    }

    @QueryHandler(queryName = "findAllUsers")
    fun findAllUsers(): List<UserView> {
        return userViewRepository.findAll(UserSpecifications.isNotDeleted())
    }

    @QueryHandler(queryName = "findUserByEmail")
    fun findByEmail(email: String): UserView? {
        val spec = UserSpecifications.hasEmail(email)!!
            .and(UserSpecifications.isNotDeleted())
        return userViewRepository.findOne(spec).orElse(null)
    }

    @QueryHandler(queryName = "findUsersByRole")
    fun findByRole(role: UserRole): List<UserView> {
        val spec = UserSpecifications.hasRole(role)!!
            .and(UserSpecifications.isNotDeleted())
        return userViewRepository.findAll(spec)
    }

    @QueryHandler
    fun findByActive(query: FindUsersByActiveStatusQuery): List<UserView> {
        val spec = UserSpecifications.isActive(query.active)!!
            .and(UserSpecifications.isNotDeleted())
        return userViewRepository.findAll(spec)
    }

    // Additional method for complex filtering
    fun findUsersWithFilters(
        role: UserRole? = null,
        active: Boolean? = null,
        nameContains: String? = null
    ): List<UserView> {
        val specs = listOfNotNull(
            UserSpecifications.hasRole(role),
            UserSpecifications.isActive(active),
            UserSpecifications.nameContains(nameContains),
            UserSpecifications.isNotDeleted()
        )

        return if (specs.isEmpty()) {
            userViewRepository.findAll()
        } else {
            val combinedSpec = specs.reduce { acc, spec -> acc.and(spec) }
            userViewRepository.findAll(combinedSpec)
        }
    }
}