package mk.ukim.finki.soa.backend.client

import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping

@FeignClient(name = "external-service")
public interface ExternalServiceClient {

    @GetMapping("/api/status")
    fun getServiceStatus(): String
}
