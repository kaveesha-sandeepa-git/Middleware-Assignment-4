package com.example.demo.integration.ros.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteOptimizeRequest {
    private Long orderId;
    private Long vehicleId;
    private String pickupAddress;
    private String deliveryAddress;
    private List<String> currentWaypoints;
    private Integer vehicleCapacity;
    private String vehicleType;
}
