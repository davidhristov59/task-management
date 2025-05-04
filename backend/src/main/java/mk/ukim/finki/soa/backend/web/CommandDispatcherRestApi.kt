package mk.ukim.finki.soa.backend.web


import org.axonframework.commandhandling.gateway.CommandGateway


import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*


@RestController
@Controller
@RequestMapping("/workspaces")
class CommandDispatcherRestApi(private val commandGateway: CommandGateway) {


}

