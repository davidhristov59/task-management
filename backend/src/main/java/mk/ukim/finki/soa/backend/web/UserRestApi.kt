package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.model.UserRole
import mk.ukim.finki.soa.backend.model.*
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.messaging.responsetypes.ResponseTypes
import org.axonframework.queryhandling.QueryGateway
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*
import java.util.concurrent.CompletableFuture

@RestController
@RequestMapping("/users")
class UserRestApi(
    private val commandGateway: CommandGateway,
    private val queryGateway: QueryGateway
) {

    @GetMapping
    fun getAllUsers(): CompletableFuture<List<UserView>> {
        return queryGateway.query(
            "findAllUsers",
            Unit,
            ResponseTypes.multipleInstancesOf(UserView::class.java)
        )
    }

    @GetMapping("/role/{role}")
    fun getUsersByRole(
        @PathVariable role: UserRole
    ): CompletableFuture<List<UserView>>{
        return queryGateway.query(
            "findUsersByRole",
            role,
            ResponseTypes.multipleInstancesOf(UserView::class.java)
        )
    }

    @GetMapping("/status")
    fun getUsersByActiveStatus(
        @RequestParam active: Boolean
    ): CompletableFuture<List<UserView>> {
        return queryGateway.query(
            FindUsersByActiveStatusQuery(active),
            ResponseTypes.multipleInstancesOf(UserView::class.java)
        )
    }

    @GetMapping("/{userId}")
    fun getUserById(
        @PathVariable userId: String
    ) : CompletableFuture<ResponseEntity<UserView>>{
        return queryGateway.query(
            "findUserById",
            UserId (userId),
            ResponseTypes.instanceOf(UserView::class.java)
        )
            .thenApply { ResponseEntity.ok(it)}
            .exceptionally {ResponseEntity.notFound().build()}
    }

    @GetMapping("/email/{email}")
    fun getUserByEmail(
        @PathVariable email: String
    ) : CompletableFuture<ResponseEntity<UserView>>{
        return queryGateway.query(
            "findUserByEmail",
            email,
            ResponseTypes.instanceOf(UserView::class.java)
        )
            .thenApply { user ->
                if (user != null) ResponseEntity.ok(user)
                else ResponseEntity.notFound().build()
            }
            .exceptionally { ResponseEntity.notFound().build() }
    }

    @PostMapping
    fun createUser(
        @RequestBody request: CreateUserRequest
    ) : CompletableFuture<ResponseEntity<UserId>> {
        val userId = UserId(UUID.randomUUID().toString())

        val command = CreateUserCommand(
            userId = userId,
            name = UserName(request.name),
            email = UserEmail(request.email),
            role = request.role
        )

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.status(HttpStatus.CREATED).body(userId) }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PutMapping("/{userId}/name")
    fun updateUserName(
        @PathVariable userId : String,
        @RequestBody request: UpdateUserNameRequest
    ) : CompletableFuture<ResponseEntity<Void>> {

        val command = UpdateUserNameCommand(
            userId = UserId(userId),
            name = UserName(request.name)
        )

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PutMapping("/{userId}/email")
    fun updateUserEmail(
        @PathVariable userId: String,
        @RequestBody request: UpdateUserEmailRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        val command = UpdateUserEmailCommand(
            userId = UserId(userId),
            email = UserEmail(request.email)
        )

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PutMapping("/{userId}/role")
    fun updateUserRole(
        @PathVariable userId: String,
        @RequestBody request: UpdateUserRoleRequest
    ): CompletableFuture<ResponseEntity<Void>> {
        val command = UpdateUserRoleCommand(
            userId = UserId(userId),
            newRole = request.role
        )

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PostMapping("/{userId}/activate")
    fun activateUser(@PathVariable userId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        val command = ActivateUserCommand(userId = UserId(userId))

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }

    @PostMapping("/{userId}/deactivate")
    fun deactivateUser(@PathVariable userId: String
    ): CompletableFuture<ResponseEntity<Void>> {
        val command = DeactivateUserCommand(userId = UserId(userId))

        return commandGateway.send<Any>(command)
            .thenApply { ResponseEntity.ok().build<Void>() }
            .exceptionally { ResponseEntity.status(HttpStatus.BAD_REQUEST).build() }
    }
}

