package mk.ukim.finki.soa.backend.config

import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.context.annotation.Configuration

@Configuration
@EnableDiscoveryClient
@EnableFeignClients(basePackages = ["mk.ukim.finki.soa.backend.client"])
open class ConsulConfig {}
