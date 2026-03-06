package com.assignment_4.SwiftLogistics.cms.kafka.publisher;

import com.assignment_4.SwiftLogistics.cms.kafka.events.OrderValidatedEvent;
import com.assignment_4.SwiftLogistics.cms.kafka.events.OrderValidationFailedEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class CmsEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String orderValidatedTopic;
    private final String orderValidationFailedTopic;

    public CmsEventPublisher(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper,
            @Value("${cms.kafka.topic.order-validated:order-validated}") String orderValidatedTopic,
            @Value("${cms.kafka.topic.order-validation-failed:order-validation-failed}") String orderValidationFailedTopic
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.orderValidatedTopic = orderValidatedTopic;
        this.orderValidationFailedTopic = orderValidationFailedTopic;
    }

    public void publishValidated(String key, OrderValidatedEvent event) {
        kafkaTemplate.send(orderValidatedTopic, key, toJson(event));
    }

    public void publishValidationFailed(String key, OrderValidationFailedEvent event) {
        kafkaTemplate.send(orderValidationFailedTopic, key, toJson(event));
    }

    private String toJson(Object event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize event to JSON", e);
        }
    }
}