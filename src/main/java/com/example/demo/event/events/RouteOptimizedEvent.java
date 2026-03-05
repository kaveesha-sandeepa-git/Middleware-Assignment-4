package com.example.demo.event.events;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteOptimizedEvent {
    private Long orderId;
    private Long routeId;
    private Long vehicleId;
    private String routeStatus;
    private List<String> optimizedWaypoints;
    private Integer estimatedDuration;
    private Double totalDistance;
    private Long timestamp;
}
