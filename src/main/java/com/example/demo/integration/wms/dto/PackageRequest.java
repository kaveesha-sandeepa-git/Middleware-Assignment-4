package com.example.demo.integration.wms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PackageRequest {
    private Long orderId;
    private String packageDetails;
    private Double packageWeight;
    private String sourceWarehouse;
    private String destinationAddress;
}
