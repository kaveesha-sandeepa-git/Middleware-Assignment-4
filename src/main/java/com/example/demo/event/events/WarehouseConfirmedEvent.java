package com.example.demo.event.events;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseConfirmedEvent {
    private Long orderId;
    private Long deliveryId;
    private String packageStatus;
    private String pickupAddress;
    private String deliveryAddress;
    private Long timestamp;
}
