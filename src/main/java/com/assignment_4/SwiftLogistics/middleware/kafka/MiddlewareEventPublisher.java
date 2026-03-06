package com.assignment_4.SwiftLogistics.middleware.kafka;

import com.assignment_4.SwiftLogistics.cms.kafka.events.OrderCreatedEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class MiddlewareEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String orderCreatedTopic;

    public MiddlewareEventPublisher(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper,
            @Value("${cms.kafka.topic.order-created:order-created}") String orderCreatedTopic
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.orderCreatedTopic = orderCreatedTopic;
    }

    public void publishOrderCreated(String orderId, String contractId, String clientId, String items, String deliveryAddress) {
        OrderCreatedEvent event = new OrderCreatedEvent(
                orderId, contractId, clientId, items, deliveryAddress, OffsetDateTime.now()
        );

        try {
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(orderCreatedTopic, orderId, json);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize OrderCreatedEvent to JSON", e);
        }
    }
}