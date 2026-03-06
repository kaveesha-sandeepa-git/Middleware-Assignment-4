package com.example.demo.event.events;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteOptimizationFailedEvent {
    private Long orderId;
    private String reason;
    private String errorMessage;
    private Long timestamp;
}
