package com.example.demo.integration.ros;

import com.example.demo.integration.ros.dto.RouteOptimizeRequest;
import com.example.demo.integration.ros.dto.RouteOptimizeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@ConditionalOnProperty(name = "service.use-mock", havingValue = "false", matchIfMissing = false)
public class ROSClient {

    private final RestTemplate restTemplate;
    
    @Value("${service.ros.url:http://localhost:8082}")
    private String rosServiceUrl;

    public ROSClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Call ROS endpoint to optimize route
     */
    public RouteOptimizeResponse optimizeRoute(RouteOptimizeRequest request) {
        try {
            log.info("Sending route optimization request to ROS for order: {}", request.getOrderId());
            
            String url = rosServiceUrl + "/api/routes/optimize";
            RouteOptimizeResponse response = restTemplate.postForObject(
                    url,
                    request,
                    RouteOptimizeResponse.class
            );
            
            log.info("Route optimization successful for order: {}, routeId: {}", 
                    request.getOrderId(), response.getRouteId());
            return response;
            
        } catch (Exception e) {
            log.error("Error calling ROS for order: {}, Error: {}", request.getOrderId(), e.getMessage());
            throw new RuntimeException("ROS service unavailable: " + e.getMessage());
        }
    }

    /**
     * Get route details from ROS
     */
    public RouteOptimizeResponse getRouteDetails(Long routeId) {
        try {
            log.info("Fetching route details from ROS for routeId: {}", routeId);
            
            String url = rosServiceUrl + "/api/routes/" + routeId;
            RouteOptimizeResponse response = restTemplate.getForObject(
                    url,
                    RouteOptimizeResponse.class
            );
            
            log.info("Retrieved route details: {}", response);
            return response;
            
        } catch (Exception e) {
            log.error("Error fetching route from ROS, Error: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch route details: " + e.getMessage());
        }
    }
}
