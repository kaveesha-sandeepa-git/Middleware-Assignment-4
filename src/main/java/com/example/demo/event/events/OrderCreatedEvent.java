package com.example.demo.event.events;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedEvent {
    private Long orderId;
    private Long clientId;
    private String pickupAddress;
    private String deliveryAddress;
    private String packageDetails;
    private Long timestamp;
}
