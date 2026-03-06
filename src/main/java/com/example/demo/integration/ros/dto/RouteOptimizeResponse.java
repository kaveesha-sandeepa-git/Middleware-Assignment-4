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
public class RouteOptimizeResponse {
    private Long routeId;
    private Long vehicleId;
    private String status;
    private List<String> optimizedWaypoints;
    private Integer estimatedDuration;
    private Double totalDistance;
    private String optimizationTimestamp;
}
