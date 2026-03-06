package com.assignment_4.SwiftLogistics.cms.kafka.events;

import java.time.OffsetDateTime;

/**
 * Published by CMS when validation fails.
 * Downstream services should stop the saga or compensate.
 */
public record OrderValidationFailedEvent(
        String orderId,
        String reason,
        String message,
        OffsetDateTime failedAt
) {}