package com.assignment_4.SwiftLogistics.cms.kafka.events;

import java.time.OffsetDateTime;

/**
 * Published by the middleware/order-service when a client submits an order.
 * CMS consumes this event and validates contract/client rules.
 */
public record OrderCreatedEvent(
        String orderId,
        String contractId,
        String clientId,
        String items,
        String deliveryAddress,
        OffsetDateTime createdAt
) {}