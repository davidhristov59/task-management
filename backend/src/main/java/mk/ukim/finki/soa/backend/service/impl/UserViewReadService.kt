package mk.ukim.finki.soa.backend.service.impl

import mk.ukim.finki.soa.backend.model.*
import mk.ukim.finki.soa.backend.repository.UserViewJpaRepository
import org.axonframework.queryhandling.QueryHandler
import org.springframework.stereotype.Service

@Service
class UserViewReadService(private val userViewRepository: UserViewJpaRepository) {

    @QueryHandler(queryName = "findUserById")
    fun findById(userId: UserId) : UserView {
        return userViewRepository.findById(userId)
            .filter { !it.deleted }
            .orElseThrow {NoSuchElementException("User not found: $userId")}
    }

    @QueryHandler(queryName = "findAllUsers")
    fun findAllUsers(): List<UserView> {
        return userViewRepository.findAll()
            .filter { !it.deleted }
    }

    @QueryHandler(queryName = "findUserByEmail")
    fun findByEmail(email: String): UserView? {
        return userViewRepository.findByEmailString(email)
            ?.takeIf { !it.deleted }
    }

    @QueryHandler(queryName = "findUsersByRole")
    fun findByRole(role: UserRole): List<UserView> {
        return userViewRepository.findByRole(role)
            .filter { !it.deleted }
    }

    @QueryHandler
    fun findByActive(query: FindUsersByActiveStatusQuery): List<UserView> {
        return userViewRepository.findByActive(query.active)
            .filter { !it.deleted }
    }
}