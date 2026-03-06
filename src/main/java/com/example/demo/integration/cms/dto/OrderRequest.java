package com.example.demo.integration.cms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private Long clientId;
    private String clientName;
    private String pickupAddress;
    private String deliveryAddress;
    private String packageDetails;
    private Double packageWeight;
    private String serviceType; // STANDARD, EXPRESS, SAME_DAY
}
