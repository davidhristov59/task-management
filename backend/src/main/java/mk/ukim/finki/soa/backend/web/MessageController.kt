package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.service.EventMessagingService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/messages")
class MessageController(private val messagingService: EventMessagingService) {

    @PostMapping
    fun sendMessage(@RequestParam topic: String, @RequestParam key: String, @RequestParam payload: String) {
        messagingService.send(topic, key, payload)
    }
}