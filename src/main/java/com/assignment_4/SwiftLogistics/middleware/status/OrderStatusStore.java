package com.assignment_4.SwiftLogistics.middleware.status;

import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OrderStatusStore {

    public record StatusEntry(String orderId, String status, String message, OffsetDateTime updatedAt) {}

    private final ConcurrentHashMap<String, StatusEntry> map = new ConcurrentHashMap<>();

    public void markSubmitted(String orderId) {
        map.put(orderId, new StatusEntry(orderId, "SUBMITTED", "Order submitted to Kafka", OffsetDateTime.now()));
    }

    public void put(String orderId, String status, String message, OffsetDateTime at) {
        map.put(orderId, new StatusEntry(orderId, status, message, at));
    }

    public Optional<StatusEntry> get(String orderId) {
        return Optional.ofNullable(map.get(orderId));
    }
}