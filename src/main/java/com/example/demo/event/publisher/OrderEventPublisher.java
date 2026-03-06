package com.example.demo.event.publisher;

import com.example.demo.event.events.OrderCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OrderEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Publish order created event to start the saga
     */
    public void publishOrderCreatedEvent(OrderCreatedEvent event) {
        try {
            log.info("Publishing OrderCreatedEvent for orderId: {}", event.getOrderId());
            kafkaTemplate.send("order-created", String.valueOf(event.getOrderId()), event);
            log.info("OrderCreatedEvent published successfully");
        } catch (Exception e) {
            log.error("Error publishing OrderCreatedEvent: {}", e.getMessage());
            throw new RuntimeException("Failed to publish order created event", e);
        }
    }
}
