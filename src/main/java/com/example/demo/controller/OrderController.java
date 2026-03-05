package com.example.demo.controller;

import com.example.demo.event.events.OrderCreatedEvent;
import com.example.demo.event.publisher.OrderEventPublisher;
import com.example.demo.integration.cms.dto.OrderRequest;
import com.example.demo.model.Delivery;
import com.example.demo.service.DeliveryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final DeliveryService deliveryService;
    private final OrderEventPublisher orderEventPublisher;

    public OrderController(DeliveryService deliveryService, OrderEventPublisher orderEventPublisher) {
        this.deliveryService = deliveryService;
        this.orderEventPublisher = orderEventPublisher;
    }

    /**
     * Submit an order - triggers the start of the saga
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitOrder(@RequestBody OrderRequest request) {
        try {
            log.info("Received order submission request from client: {}", request.getClientName());

            // Create delivery record
            Delivery delivery = new Delivery();
            delivery.setClientName(request.getClientName());
            delivery.setAddress(request.getPickupAddress());
            delivery.setDestination(request.getDeliveryAddress());
            delivery.setStatus("SUBMITTED");
            delivery.setCreatedAt(LocalDateTime.now());

            Delivery savedDelivery = deliveryService.saveDelivery(delivery);
            
            log.info("Order created with deliveryId: {}", savedDelivery.getId());

            // Publish OrderCreatedEvent to trigger saga
            OrderCreatedEvent orderEvent = new OrderCreatedEvent();
            orderEvent.setOrderId(savedDelivery.getId());
            orderEvent.setClientId(request.getClientId());
            orderEvent.setPickupAddress(request.getPickupAddress());
            orderEvent.setDeliveryAddress(request.getDeliveryAddress());
            orderEvent.setPackageDetails(request.getPackageDetails());
            orderEvent.setTimestamp(System.currentTimeMillis());

            orderEventPublisher.publishOrderCreatedEvent(orderEvent);
            
            log.info("OrderCreatedEvent published for orderId: {}", savedDelivery.getId());

            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedDelivery.getId());
            response.put("status", "SUBMITTED");
            response.put("message", "Order submitted successfully. Processing has started.");
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Error submitting order: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to submit order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get order status
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderStatus(@PathVariable Long orderId) {
        try {
            log.info("Fetching order status for orderId: {}", orderId);
            Delivery delivery = deliveryService.getDeliveryById(orderId);

            if (delivery == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", delivery.getId());
            response.put("clientName", delivery.getClientName());
            response.put("status", delivery.getStatus());
            response.put("destination", delivery.getDestination());
            response.put("createdAt", delivery.getCreatedAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching order status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch order status"));
        }
    }
}
