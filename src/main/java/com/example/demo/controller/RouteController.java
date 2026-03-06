package com.example.demo.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.integration.ros.ROSClient;
import com.example.demo.integration.ros.dto.RouteOptimizeRequest;
import com.example.demo.integration.ros.dto.RouteOptimizeResponse;
import com.example.demo.model.Delivery;
import com.example.demo.model.Route;
import com.example.demo.service.DeliveryService;
import com.example.demo.service.RouteService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/routes")
@ConditionalOnProperty(name = "service.use-mock", havingValue = "false")
public class RouteController {

    private final RouteService routeService;
    private final DeliveryService deliveryService;
    
    @Autowired(required = false)
    private ROSClient rosClient;

    public RouteController(RouteService routeService, DeliveryService deliveryService) {
        this.routeService = routeService;
        this.deliveryService = deliveryService;
    }

    /**
     * Optimize route for a delivery using ROS
     */
    @PostMapping("/optimize")
    public ResponseEntity<?> optimizeRoute(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = ((Number) request.get("orderId")).longValue();
            log.info("Route optimization request for orderId: {}", orderId);

            // Get delivery details
            Delivery delivery = deliveryService.getDeliveryById(orderId);
            if (delivery == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found"));
            }

            // Build ROS request
            RouteOptimizeRequest rosRequest = new RouteOptimizeRequest();
            rosRequest.setOrderId(orderId);
            rosRequest.setVehicleId(1L); // Default vehicle
            rosRequest.setPickupAddress(delivery.getAddress());
            rosRequest.setDeliveryAddress(delivery.getDestination());
            rosRequest.setCurrentWaypoints(Arrays.asList(delivery.getAddress(), delivery.getDestination()));
            rosRequest.setVehicleCapacity(100);
            rosRequest.setVehicleType("VAN");

            // Call ROS via ROSClient
            RouteOptimizeResponse rosResponse = rosClient.optimizeRoute(rosRequest);

            // Save route information
            Route route = new Route();
            route.setOptimizedRouteId(rosResponse.getRouteId());
            route.setStatus(rosResponse.getStatus());
            if (rosResponse.getEstimatedDuration() != null) {
                route.setEstimatedTime(rosResponse.getEstimatedDuration());
            }
            route.setTotalDistance(rosResponse.getTotalDistance());
            routeService.saveRoute(route);

            // Update delivery status
            delivery.setStatus("ASSIGNED");
            deliveryService.saveDelivery(delivery);

            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("routeId", rosResponse.getRouteId());
            response.put("orderId", orderId);
            response.put("status", rosResponse.getStatus());
            response.put("optimizedWaypoints", rosResponse.getOptimizedWaypoints());
            response.put("estimatedDuration", rosResponse.getEstimatedDuration());
            response.put("totalDistance", rosResponse.getTotalDistance());
            response.put("vehicleId", rosResponse.getVehicleId());
            response.put("optimizationTimestamp", rosResponse.getOptimizationTimestamp());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error optimizing route: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Route optimization failed", "message", e.getMessage()));
        }
    }

    /**
     * Get route details
     */
    @GetMapping("/{routeId}")
    public ResponseEntity<?> getRouteDetails(@PathVariable Long routeId) {
        try {
            log.info("Fetching route details for routeId: {}", routeId);
            
            // Try to get from ROS
            RouteOptimizeResponse rosResponse = rosClient.getRouteDetails(routeId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("routeId", rosResponse.getRouteId());
            response.put("status", rosResponse.getStatus());
            response.put("vehicleId", rosResponse.getVehicleId());
            response.put("estimatedDuration", rosResponse.getEstimatedDuration());
            response.put("totalDistance", rosResponse.getTotalDistance());
            response.put("optimizedWaypoints", rosResponse.getOptimizedWaypoints());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching route details: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch route details"));
        }
    }

    @PostMapping
    public Route createDelivery(@RequestBody Route route) {
        return routeService.saveRoute(route);
    }

    @GetMapping
    public List<Route> getRoutes() {
        return routeService.getAllRoutes();
    }
}
