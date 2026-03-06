package com.example.demo.event.publisher;

import com.example.demo.event.events.RouteOptimizedEvent;
import com.example.demo.event.events.RouteOptimizationFailedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class RouteEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public RouteEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Publish route optimization successful event
     */
    public void publishRouteOptimizedEvent(RouteOptimizedEvent event) {
        try {
            log.info("Publishing RouteOptimizedEvent for orderId: {}, routeId: {}", 
                    event.getOrderId(), event.getRouteId());
            kafkaTemplate.send("route-optimized", String.valueOf(event.getOrderId()), event);
            log.info("RouteOptimizedEvent published successfully");
        } catch (Exception e) {
            log.error("Error publishing RouteOptimizedEvent: {}", e.getMessage());
            throw new RuntimeException("Failed to publish route optimized event", e);
        }
    }

    /**
     * Publish route optimization failed event
     */
    public void publishRouteOptimizationFailedEvent(RouteOptimizationFailedEvent event) {
        try {
            log.info("Publishing RouteOptimizationFailedEvent for orderId: {}", event.getOrderId());
            kafkaTemplate.send("route-optimization-failed", String.valueOf(event.getOrderId()), event);
            log.info("RouteOptimizationFailedEvent published successfully");
        } catch (Exception e) {
            log.error("Error publishing RouteOptimizationFailedEvent: {}", e.getMessage());
            throw new RuntimeException("Failed to publish route optimization failed event", e);
        }
    }
}
