package com.assignment_4.SwiftLogistics.middleware.kafka;

import com.assignment_4.SwiftLogistics.cms.kafka.events.OrderValidatedEvent;
import com.assignment_4.SwiftLogistics.cms.kafka.events.OrderValidationFailedEvent;
import com.assignment_4.SwiftLogistics.middleware.status.OrderStatusStore;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class MiddlewareResultConsumer {

    private final OrderStatusStore store;

    public MiddlewareResultConsumer(OrderStatusStore store) {
        this.store = store;
    }

    @KafkaListener(topics = "${cms.kafka.topic.order-validated:order-validated}")
    public void onValidated(OrderValidatedEvent event) {
        store.put(event.orderId(), event.status(), event.message(), event.validatedAt());
    }

    @KafkaListener(topics = "${cms.kafka.topic.order-validation-failed:order-validation-failed}")
    public void onFailed(OrderValidationFailedEvent event) {
        store.put(event.orderId(), "VALIDATION_FAILED", event.reason() + ": " + event.message(), event.failedAt());
    }
}