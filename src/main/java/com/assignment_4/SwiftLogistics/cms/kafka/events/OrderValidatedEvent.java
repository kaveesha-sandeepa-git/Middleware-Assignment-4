package com.assignment_4.SwiftLogistics.cms.kafka.events;

import java.time.OffsetDateTime;

/**
 * Published by CMS when validation passes AND CMS records the order.
 */
public record OrderValidatedEvent(
        String orderId,
        String cmsOrderId,
        String status,
        String message,
        OffsetDateTime validatedAt
) {}