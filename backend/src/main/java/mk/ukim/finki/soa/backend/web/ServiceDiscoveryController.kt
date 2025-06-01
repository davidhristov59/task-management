package mk.ukim.finki.soa.backend.web

import mk.ukim.finki.soa.backend.client.ExternalServiceClient
import org.springframework.cloud.client.ServiceInstance
import org.springframework.cloud.client.discovery.DiscoveryClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/discovery")
class ServiceDiscoveryController(
    private val discoveryClient: DiscoveryClient,
    private val externalServiceClient: ExternalServiceClient
) {

    @GetMapping("/services")
    fun getServices(): List<String> {
        return discoveryClient.services
    }

    @GetMapping("/services/{serviceId}")
    fun getServiceInstances(@PathVariable serviceId: String): List<String> {
        return discoveryClient.getInstances(serviceId)
            .map { instance -> "${instance.serviceId} - ${instance.uri}" }
    }

    @GetMapping("/external-service/status")
    fun getExternalServiceStatus(): String {
        return try {
            externalServiceClient.getServiceStatus()
        } catch (e: Exception) {
            "Error connecting to external service: ${e.message}"
        }
    }

    @GetMapping("/status")
    fun getStatus(): String {
        return "Task Management Service is UP and registered with Consul"
    }
}
