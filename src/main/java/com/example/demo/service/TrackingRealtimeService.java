package com.example.demo.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.integration.ros.ROSClient;
import com.example.demo.integration.ros.dto.RouteOptimizeResponse;
import com.example.demo.model.Delivery;
import com.example.demo.model.Route;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TrackingRealtimeService {

    private static final long SSE_TIMEOUT_MS = 0L;

    private final RouteService routeService;
    private final DeliveryService deliveryService;
    private final Optional<ROSClient> rosClient;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final Map<Long, String> lastBroadcastedStatusByOrderId = new HashMap<>();

    @Value("${service.use-mock:true}")
    private boolean useMock;

    public TrackingRealtimeService(
            RouteService routeService,
            DeliveryService deliveryService,
            Optional<ROSClient> rosClient) {
        this.routeService = routeService;
        this.deliveryService = deliveryService;
        this.rosClient = rosClient;
    }

    public SseEmitter subscribeToTracking() {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(ex -> emitters.remove(emitter));

        sendInitialSnapshot(emitter);
        return emitter;
    }

    public List<Map<String, Object>> getTrackingOrders() {
        List<Delivery> deliveries = deliveryService.getAllDeliveries();
        List<Map<String, Object>> trackingOrders = new ArrayList<>();

        for (Delivery delivery : deliveries) {
            Map<String, Object> view = buildTrackingOrderView(delivery);
            trackingOrders.add(view);
        }

        return trackingOrders;
    }

    public Optional<Map<String, Object>> getTrackingOrder(Long orderId) {
        Optional<Delivery> deliveryOpt = deliveryService.findByOrderId(orderId);
        return deliveryOpt.map(this::buildTrackingOrderView);
    }

    public void publishSingleOrderUpdate(Long orderId) {
        Optional<Map<String, Object>> trackingOrder = getTrackingOrder(orderId);
        trackingOrder.ifPresent(view -> {
            String status = String.valueOf(view.get("status"));
            String previousStatus = lastBroadcastedStatusByOrderId.get(orderId);
            if (!status.equals(previousStatus)) {
                lastBroadcastedStatusByOrderId.put(orderId, status);
            }
            broadcast("tracking_update", view);
        });
    }

    public void updateOrderStatus(Long orderId, String newStatus) {
        Optional<Delivery> deliveryOpt = deliveryService.findByOrderId(orderId);
        if (!deliveryOpt.isPresent()) {
            throw new IllegalArgumentException("Delivery not found for orderId: " + orderId);
        }

        Delivery delivery = deliveryOpt.get();
        String normalizedStatus = newStatus.toUpperCase().replace("_", "_");
        
        // Update delivery status
        delivery.setStatus(normalizedStatus);
        deliveryService.saveDelivery(delivery);

        // Update associated route if exists
        Optional<Route> routeOpt = routeService.findLatestByDeliveryId(delivery.getId());
        if (routeOpt.isPresent()) {
            Route route = routeOpt.get();
            route.setStatus(normalizedStatus);
            routeService.saveRoute(route);
        }

        // Publish update to all subscribers
        publishSingleOrderUpdate(orderId);
    }

    @Scheduled(fixedDelay = 5000)
    public void refreshRouteStatuses() {
        List<Route> routes = routeService.findAllOptimizedRoutes();
        for (Route route : routes) {
            Delivery delivery = route.getDeliveryId();
            if (delivery == null) {
                continue;
            }

            Long orderId = delivery.getOrderId();
            String newStatus = resolveLatestRouteStatus(route);
            if (newStatus == null || newStatus.isBlank()) {
                continue;
            }

            if (!newStatus.equalsIgnoreCase(route.getStatus())) {
                route.setStatus(newStatus);
                routeService.saveRoute(route);
            }

            if (!newStatus.equalsIgnoreCase(delivery.getStatus())) {
                delivery.setStatus(newStatus);
                deliveryService.saveDelivery(delivery);
            }

            String normalized = newStatus.toUpperCase();
            String previous = lastBroadcastedStatusByOrderId.get(orderId);
            if (!normalized.equals(previous)) {
                lastBroadcastedStatusByOrderId.put(orderId, normalized);
                publishSingleOrderUpdate(orderId);
            }
        }
    }

    private Map<String, Object> buildTrackingOrderView(Delivery delivery) {
        Map<String, Object> view = new HashMap<>();
        Optional<Route> routeOpt = routeService.findLatestByDeliveryId(delivery.getId());

        String status = routeOpt.map(Route::getStatus).orElse(delivery.getStatus());
        if (status == null || status.isBlank()) {
            status = "PENDING";
        }

        view.put("orderId", delivery.getOrderId());
        view.put("deliveryId", delivery.getId());
        view.put("customerName", delivery.getClientName());
        view.put("deliveryAddress", delivery.getDestination());
        view.put("status", status.toUpperCase());
        view.put("createdAt", delivery.getCreatedAt());

        if (routeOpt.isPresent()) {
            Route route = routeOpt.get();
            view.put("routeId", route.getOptimizedRouteId());
            view.put("estimatedDuration", route.getEstimatedTime());
            view.put("totalDistance", route.getTotalDistance());
            view.put("routeStatus", route.getStatus());
        } else {
            // Generate mock tracking values when no route exists
            Map<String, Object> mockValues = generateMockTrackingValues(delivery.getOrderId());
            view.putAll(mockValues);
        }

        return view;
    }

    private Map<String, Object> generateMockTrackingValues(Long orderId) {
        Map<String, Object> mock = new HashMap<>();
        // Generate deterministic but varied values based on orderId
        long seed = orderId != null ? orderId : System.nanoTime();
        ThreadLocalRandom rng = ThreadLocalRandom.current();
        
        mock.put("routeId", 10000L + (seed % 90000));
        mock.put("estimatedDuration", 20 + (seed % 50));
        mock.put("totalDistance", 5.0 + ((seed % 200) / 10.0));
        
        return mock;
    }

    private String resolveLatestRouteStatus(Route route) {
        if (useMock) {
            return getMockStatus(route);
        }

        if (route.getOptimizedRouteId() == null) {
            return route.getStatus();
        }

        try {
            RouteOptimizeResponse response = rosClient
                    .orElseThrow(() -> new RuntimeException("ROSClient bean is not available while service.use-mock=false"))
                    .getRouteDetails(route.getOptimizedRouteId());

            if (response != null) {
                if (response.getEstimatedDuration() != null) {
                    route.setEstimatedTime(response.getEstimatedDuration());
                }
                if (response.getTotalDistance() != null) {
                    route.setTotalDistance(response.getTotalDistance());
                }
                if (response.getStatus() != null && !response.getStatus().isBlank()) {
                    return response.getStatus();
                }
            }
        } catch (Exception e) {
            log.debug("ROS polling skipped for route {}: {}", route.getOptimizedRouteId(), e.getMessage());
        }

        return route.getStatus();
    }

    private String getMockStatus(Route route) {
        LocalDateTime createdAt = route.getCreatedAt();
        if (createdAt == null) {
            return route.getStatus();
        }

        long minutes = java.time.Duration.between(createdAt, LocalDateTime.now()).toMinutes();
        if (minutes < 1) {
            return "OPTIMIZED";
        }
        if (minutes < 2) {
            return "IN_TRANSIT";
        }
        if (minutes < 3) {
            return "OUT_FOR_DELIVERY";
        }
        return "DELIVERED";
    }

    private void sendInitialSnapshot(SseEmitter emitter) {
        try {
            emitter.send(SseEmitter.event()
                    .name("tracking_snapshot")
                    .data(getTrackingOrders()));
        } catch (IOException e) {
            emitter.completeWithError(e);
            emitters.remove(emitter);
        }
    }

    private void broadcast(String eventName, Object payload) {
        List<SseEmitter> failedEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(payload));
            } catch (IOException e) {
                failedEmitters.add(emitter);
            }
        }

        emitters.removeAll(failedEmitters);
    }
}
