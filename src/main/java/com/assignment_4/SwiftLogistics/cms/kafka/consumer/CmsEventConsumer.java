package com.assignment_4.SwiftLogistics.cms.kafka.consumer;

import com.assignment_4.SwiftLogistics.cms.kafka.events.OrderCreatedEvent;
import com.assignment_4.SwiftLogistics.cms.kafka.events.OrderValidatedEvent;
import com.assignment_4.SwiftLogistics.cms.kafka.events.OrderValidationFailedEvent;
import com.assignment_4.SwiftLogistics.cms.kafka.publisher.CmsEventPublisher;
import com.assignment_4.SwiftLogistics.cms.services.CmsSagaService;
import com.assignment_4.SwiftLogistics.domain.entities.Order;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class CmsEventConsumer {

    private final CmsSagaService cmsSagaService;
    private final CmsEventPublisher publisher;

    public CmsEventConsumer(CmsSagaService cmsSagaService, CmsEventPublisher publisher) {
        this.cmsSagaService = cmsSagaService;
        this.publisher = publisher;
    }

    @KafkaListener(
            topics = "${cms.kafka.topic.order-created:order-created}",
            groupId = "${spring.application.name:swiftlogistics-cms}"
    )
    public void onOrderCreated(OrderCreatedEvent event) {
        String key = event.orderId();

        try {
            Order saved = cmsSagaService.validateAndRecord(event);

            publisher.publishValidated(key, new OrderValidatedEvent(
                    event.orderId(),
                    saved.getOrderId().toString(),
                    "VALIDATED",
                    "Order validated and recorded in CMS",
                    OffsetDateTime.now()
            ));
        } catch (Exception ex) {
            publisher.publishValidationFailed(key, new OrderValidationFailedEvent(
                    event.orderId(),
                    "CMS_VALIDATION_FAILED",
                    ex.getMessage() == null ? "Validation failed" : ex.getMessage(),
                    OffsetDateTime.now()
            ));
        }
    }
}