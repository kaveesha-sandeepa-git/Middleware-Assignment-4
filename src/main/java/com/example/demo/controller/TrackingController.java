package com.example.demo.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.model.Delivery;
import com.example.demo.model.Route;
import com.example.demo.service.DeliveryService;
import com.example.demo.service.RouteService;
import com.example.demo.service.TrackingRealtimeService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    private final TrackingRealtimeService trackingRealtimeService;
    private final DeliveryService deliveryService;
    private final RouteService routeService;

    public TrackingController(
            TrackingRealtimeService trackingRealtimeService,
            DeliveryService deliveryService,
            RouteService routeService) {
        this.trackingRealtimeService = trackingRealtimeService;
        this.deliveryService = deliveryService;
        this.routeService = routeService;
    }

    @GetMapping("/orders")
    public Map<String, Object> getTrackingOrders() {
        List<Map<String, Object>> orders = trackingRealtimeService.getTrackingOrders();
        Map<String, Object> response = new HashMap<>();
        response.put("orders", orders);
        response.put("total", orders.size());
        return response;
    }

    @GetMapping("/orders/{orderId}")
    public Map<String, Object> getTrackingOrder(@PathVariable Long orderId) {
        Optional<Map<String, Object>> orderOpt = trackingRealtimeService.getTrackingOrder(orderId);
        if (orderOpt.isPresent()) {
            return Map.of("order", orderOpt.get());
        }
        return Map.of("error", "Order not found");
    }

    @GetMapping(value = "/stream", produces = "text/event-stream")
    public SseEmitter streamTrackingUpdates() {
        log.info("Client subscribed to tracking stream");
        return trackingRealtimeService.subscribeToTracking();
    }

    @PostMapping("/update")
    public Map<String, Object> pushOrderUpdate(@RequestBody Map<String, Object> request) {
        try {
            Object orderIdValue = request.get("orderId");
            if (orderIdValue == null) {
                throw new IllegalArgumentException("orderId is required");
            }
            Long orderId = orderIdValue instanceof Number
                    ? ((Number) orderIdValue).longValue()
                    : Long.valueOf(orderIdValue.toString());
            
            String status = (String) request.get("status");
            if (status != null && !status.isBlank()) {
                // Update status if provided
                trackingRealtimeService.updateOrderStatus(orderId, status);
            } else {
                // Just publish current status if no status update provided
                trackingRealtimeService.publishSingleOrderUpdate(orderId);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tracking update published");
            return response;

        } catch (RuntimeException e) {
            log.error("Error updating delivery status: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return error;
        }
    }

    @PostMapping("/demo/seed")
    public Map<String, Object> seedTrackingDemoData(@RequestBody(required = false) Map<String, Object> request) {
        int count = 4;
        if (request != null && request.get("count") instanceof Number number) {
            count = Math.max(1, Math.min(number.intValue(), 20));
        }

        long orderBase = System.currentTimeMillis() / 1000;

        for (int i = 0; i < count; i++) {
            long orderId = orderBase + i;
            while (deliveryService.findByOrderId(orderId).isPresent()) {
                orderId++;
            }

            Delivery delivery = new Delivery();
            delivery.setOrderId(orderId);
            delivery.setClientName("Demo Client " + (i + 1));
            delivery.setAddress("Warehouse Hub A");
            delivery.setDestination((100 + i) + " Lake Road, Colombo");
            delivery.setStatus("ASSIGNED");
            delivery.setCreatedAt(LocalDateTime.now());
            Delivery savedDelivery = deliveryService.saveDelivery(delivery);

            Route route = new Route();
            route.setDeliveryId(savedDelivery);
            route.setRouteDate(LocalDate.now());
            route.setStatus("ASSIGNED");
            route.setEstimatedTime(20 + ThreadLocalRandom.current().nextInt(55));
            route.setCreatedAt(LocalDateTime.now());
            route.setOptimizedRouteId(orderId + 10_000L);
            route.setTotalDistance(5.0 + ThreadLocalRandom.current().nextDouble(20.0));
            routeService.saveRoute(route);

            trackingRealtimeService.publishSingleOrderUpdate(orderId);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("seeded", count);
        response.put("message", "Demo tracking orders created and published");
        return response;
    }
}
