package mk.ukim.finki.soa.backend.client

import org.springframework.stereotype.Component

@Component
class ExternalServiceFallback : ExternalServiceClient {

    override fun getServiceStatus(): String {
        return "External service is currently unavailable. This is a fallback response."
    }
}
