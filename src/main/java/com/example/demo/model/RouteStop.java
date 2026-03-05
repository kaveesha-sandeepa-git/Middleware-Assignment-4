package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="routeStop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne@JoinColumn(name="routeId")
    private Route routeId;

    @ManyToOne@JoinColumn(name="deliveryId")
    private Delivery deliveryPointId;

    @Column(unique = true, nullable = false)
    private int sequenceNumber;
    private LocalDateTime estimatedArrivalTime;
}
