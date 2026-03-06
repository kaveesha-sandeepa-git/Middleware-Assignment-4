package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Delivery;
import com.example.demo.service.DeliveryService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final DeliveryService deliveryService;

    public OrderController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    /**
     * Get all orders for the current client
     */
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        try {
            log.info("Fetching all orders");
            List<Delivery> deliveries = deliveryService.getAllDeliveries();
            
            List<Map<String, Object>> orders = deliveries.stream().map(delivery -> {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("id", delivery.getId());
                orderMap.put("orderId", delivery.getOrderId());
                orderMap.put("customerName", delivery.getClientName());
                orderMap.put("deliveryAddress", delivery.getDestination());
                orderMap.put("status", delivery.getStatus());
                orderMap.put("createdAt", delivery.getCreatedAt());
                orderMap.put("pickupAddress", delivery.getAddress());
                return orderMap;
            }).collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("orders", orders);
            response.put("total", orders.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch orders"));
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
