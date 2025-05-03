package mk.ukim.finki.soa.backend.service

interface EventMessagingService {
    fun send(topic: String, key: String, payload: String)
}