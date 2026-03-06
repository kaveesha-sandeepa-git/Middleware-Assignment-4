package com.example.demo.event.consumer;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.example.demo.event.events.RouteOptimizationFailedEvent;
import com.example.demo.event.events.RouteOptimizedEvent;
import com.example.demo.event.events.WarehouseConfirmedEvent;
import com.example.demo.event.publisher.RouteEventPublisher;
import com.example.demo.integration.ros.ROSClient;
import com.example.demo.integration.ros.dto.RouteOptimizeRequest;
import com.example.demo.integration.ros.dto.RouteOptimizeResponse;
import com.example.demo.mock.ros.MockROSService;
import com.example.demo.model.Delivery;
import com.example.demo.model.Route;
import com.example.demo.service.DeliveryService;
import com.example.demo.service.RouteService;
import com.example.demo.service.TrackingRealtimeService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ROSEventConsumer {

    private final RouteService routeService;
    private final RouteEventPublisher routeEventPublisher;
    private final DeliveryService deliveryService;
    private final TrackingRealtimeService trackingRealtimeService;
    private final Optional<ROSClient> rosClient;
    private final Optional<MockROSService> mockROSService;

    @Value("${service.use-mock:true}")
    private boolean useMock;

    public ROSEventConsumer(
            RouteService routeService,
            RouteEventPublisher routeEventPublisher,
            DeliveryService deliveryService,
            TrackingRealtimeService trackingRealtimeService,
            Optional<ROSClient> rosClient,
            Optional<MockROSService> mockROSService) {
        this.routeService = routeService;
        this.routeEventPublisher = routeEventPublisher;
        this.deliveryService = deliveryService;
        this.trackingRealtimeService = trackingRealtimeService;
        this.rosClient = rosClient;
        this.mockROSService = mockROSService;
    }

    /**
     * Listen for warehouse confirmed events
     * This triggers the ROS route optimization saga step
     */
    @KafkaListener(topics = "warehouse-confirmed", groupId = "${spring.application.name}")
    public void consumeWarehouseConfirmedEvent(WarehouseConfirmedEvent event) {
        try {
            log.info("ROSEventConsumer: Received WarehouseConfirmedEvent for orderId: {}, deliveryId: {}", 
                    event.getOrderId(), event.getDeliveryId());

            // Call ROS to optimize route
            optimizeRoute(event);

        } catch (Exception e) {
            log.error("Error processing WarehouseConfirmedEvent: {}", e.getMessage(), e);
            publishOptimizationFailedEvent(event.getOrderId(), "Error: " + e.getMessage());
        }
    }

    /**
     * Orchestrate route optimization
     */
    private void optimizeRoute(WarehouseConfirmedEvent event) {
        try {
            // Create request for ROS
            RouteOptimizeRequest request = createRouteOptimizeRequest(event);
            
            log.info("Calling ROS for route optimization (mock={})", useMock);
            
            RouteOptimizeResponse rosResponse;
            if (useMock) {
                rosResponse = mockROSService
                        .orElseThrow(() -> new RuntimeException("MockROSService bean is not available while service.use-mock=true"))
                        .optimizeRoute(request);
            } else {
                rosResponse = rosClient
                        .orElseThrow(() -> new RuntimeException("ROSClient bean is not available while service.use-mock=false"))
                        .optimizeRoute(request);
            }

            // Validate ROS response
            if (rosResponse == null || rosResponse.getRouteId() == null) {
                throw new RuntimeException("Invalid ROS response");
            }

            log.info("ROS returned optimized route: {}", rosResponse.getRouteId());

            // Save route to database
            saveOptimizedRoute(event, rosResponse);

            // Publish success event
            publishRouteOptimizedEvent(event, rosResponse);
            trackingRealtimeService.publishSingleOrderUpdate(event.getOrderId());

            log.info("Route optimization saga step completed successfully for orderId: {}", event.getOrderId());

        } catch (RuntimeException e) {
            log.error("Route optimization failed for orderId: {}, Error: {}", event.getOrderId(), e.getMessage());
            publishOptimizationFailedEvent(event.getOrderId(), e.getMessage());
            throw e;
        }
    }

    /**
     * Create ROS request from warehouse event
     */
    private RouteOptimizeRequest createRouteOptimizeRequest(WarehouseConfirmedEvent event) {
        RouteOptimizeRequest request = new RouteOptimizeRequest();
        request.setOrderId(event.getOrderId());
        request.setPickupAddress(event.getPickupAddress());
        request.setDeliveryAddress(event.getDeliveryAddress());
        request.setVehicleCapacity(100); // Default capacity
        request.setVehicleType("DELIVERY_VAN");
        
        return request;
    }

    /**
     * Save optimized route to database
     */
    private void saveOptimizedRoute(WarehouseConfirmedEvent event, RouteOptimizeResponse rosResponse) {
        Delivery delivery = deliveryService.getDeliveryById(event.getDeliveryId());
        if (delivery == null) {
            throw new RuntimeException("Delivery not found for deliveryId: " + event.getDeliveryId());
        }

        delivery.setStatus("OPTIMIZED");
        deliveryService.saveDelivery(delivery);

        Route route = new Route();
        route.setDeliveryId(delivery);
        route.setRouteDate(LocalDate.now());
        route.setStatus("OPTIMIZED");
        Integer estimatedDuration = rosResponse.getEstimatedDuration();
        route.setEstimatedTime(estimatedDuration != null ? estimatedDuration : 0);
        route.setCreatedAt(LocalDateTime.now());
        route.setOptimizedRouteId(rosResponse.getRouteId());
        route.setTotalDistance(rosResponse.getTotalDistance());
        
        routeService.saveRoute(route);
    }

    /**
     * Publish route optimized event for next saga step
     */
    private void publishRouteOptimizedEvent(WarehouseConfirmedEvent event, RouteOptimizeResponse rosResponse) {
        RouteOptimizedEvent optimizedEvent = new RouteOptimizedEvent();
        optimizedEvent.setOrderId(event.getOrderId());
        optimizedEvent.setRouteId(rosResponse.getRouteId());
        optimizedEvent.setVehicleId(rosResponse.getVehicleId());
        optimizedEvent.setRouteStatus(rosResponse.getStatus());
        optimizedEvent.setOptimizedWaypoints(rosResponse.getOptimizedWaypoints());
        optimizedEvent.setEstimatedDuration(rosResponse.getEstimatedDuration());
        optimizedEvent.setTotalDistance(rosResponse.getTotalDistance());
        optimizedEvent.setTimestamp(System.currentTimeMillis());
        
        routeEventPublisher.publishRouteOptimizedEvent(optimizedEvent);
    }

    /**
     * Publish route optimization failed event
     */
    private void publishOptimizationFailedEvent(Long orderId, String errorMessage) {
        RouteOptimizationFailedEvent failedEvent = new RouteOptimizationFailedEvent();
        failedEvent.setOrderId(orderId);
        failedEvent.setReason("ROUTE_OPTIMIZATION_FAILED");
        failedEvent.setErrorMessage(errorMessage);
        failedEvent.setTimestamp(System.currentTimeMillis());
        
        routeEventPublisher.publishRouteOptimizationFailedEvent(failedEvent);
    }
}
