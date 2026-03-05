package com.example.demo.mock.ros;

import com.example.demo.integration.ros.dto.RouteOptimizeRequest;
import com.example.demo.integration.ros.dto.RouteOptimizeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Random;

@Slf4j
@Service
@ConditionalOnProperty(name = "service.use-mock", havingValue = "true", matchIfMissing = true)
public class MockROSService {

    private final Random random = new Random();

    /**
     * Simulate ROS route optimization
     * In a real scenario, this would use sophisticated algorithms
     */
    public RouteOptimizeResponse optimizeRoute(RouteOptimizeRequest request) {
        log.info("MOCK ROS: Processing route optimization for order: {}", request.getOrderId());
        
        // Simulate processing time
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        RouteOptimizeResponse response = new RouteOptimizeResponse();
        response.setRouteId(generateRouteId());
        response.setVehicleId(request.getVehicleId() != null ? request.getVehicleId() : 1L);
        response.setStatus("OPTIMIZED");
        
        // Generate mock optimized waypoints
        response.setOptimizedWaypoints(Arrays.asList(
                request.getPickupAddress(),
                "Waypoint A - Colombo Central",
                "Waypoint B - Colombo East",
                request.getDeliveryAddress()
        ));
        
        // Mock estimated duration (in minutes)
        response.setEstimatedDuration(45 + random.nextInt(30));
        
        // Mock total distance (in km)
        response.setTotalDistance(12.5 + random.nextDouble() * 10);
        
        response.setOptimizationTimestamp(LocalDateTime.now().toString());
        
        log.info("MOCK ROS: Route optimized successfully. RouteId: {}, Duration: {}min, Distance: {}km",
                response.getRouteId(), response.getEstimatedDuration(), 
                String.format("%.2f", response.getTotalDistance()));
        
        return response;
    }

    /**
     * Generate a mock route ID
     */
    private Long generateRouteId() {
        return System.currentTimeMillis() / 1000;
    }
}
