package com.example.demo.event.events;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderValidatedEvent {
    private Long orderId;
    private Long clientId;
    private String validationStatus;
    private String validatedAt;
    private Long timestamp;
}
