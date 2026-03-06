package com.example.demo.mock.ros;

import com.example.demo.integration.ros.dto.RouteOptimizeRequest;
import com.example.demo.integration.ros.dto.RouteOptimizeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/routes")
@ConditionalOnProperty(name = "service.use-mock", havingValue = "true", matchIfMissing = true)
public class MockROSController {

    private final MockROSService mockROSService;

    public MockROSController(MockROSService mockROSService) {
        this.mockROSService = mockROSService;
    }

    @PostMapping("/optimize")
    public RouteOptimizeResponse optimizeRoute(@RequestBody RouteOptimizeRequest request) {
        log.info("MOCK ROS Endpoint: Received route optimization request for order: {}", request.getOrderId());
        return mockROSService.optimizeRoute(request);
    }

    @GetMapping("/{routeId}")
    public RouteOptimizeResponse getRouteDetails(@PathVariable Long routeId) {
        log.info("MOCK ROS Endpoint: Fetching route details for routeId: {}", routeId);
        
        RouteOptimizeResponse response = new RouteOptimizeResponse();
        response.setRouteId(routeId);
        response.setStatus("ACTIVE");
        response.setVehicleId(1L);
        response.setEstimatedDuration(45);
        response.setTotalDistance(12.5);
        
        return response;
    }
}
