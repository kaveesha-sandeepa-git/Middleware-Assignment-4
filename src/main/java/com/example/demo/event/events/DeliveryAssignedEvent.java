package com.example.demo.event.events;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignedEvent {
    private Long orderId;
    private Long vehicleId;
    private Long driverId;
    private String driverName;
    private Long routeId;
    private String assignmentStatus;
    private Long timestamp;
}
