package com.assignment_4.SwiftLogistics.api.orders;

public record OrderDto(
        String id,
        String customerName,
        String customerEmail,
        String deliveryAddress,
        String status,
        String createdAt
) {}