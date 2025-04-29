package mk.ukim.finki.soa.backend.repository

interface EventMessagingRepository {
    fun send(topic: String, key: String, payload: String)
}