package com.assignment_4.SwiftLogistics.api.orders;

public record CreateOrderRequest(
        String customerName,
        String customerEmail,
        DeliveryAddress deliveryAddress,
        PackageDetails packageDetails,
        String priority
) {
    public record DeliveryAddress(String street, String city, String state, String zipCode) {}
    public record PackageDetails(Double weight, String description) {}
}