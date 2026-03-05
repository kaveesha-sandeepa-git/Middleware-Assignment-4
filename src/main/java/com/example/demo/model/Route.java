package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name ="route")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name="vehicleId")
    private Vehicle vehicleId;

    @ManyToOne
    @JoinColumn(name="deliveryId")
    private Delivery deliveryId;

    @Column(nullable = false)
    private LocalDate routeDate;
    private String status;
    private int estimatedTime;
    private LocalDateTime createdAt;
    
    // ROS Integration Fields
    private Long optimizedRouteId;
    private Double totalDistance;
}
