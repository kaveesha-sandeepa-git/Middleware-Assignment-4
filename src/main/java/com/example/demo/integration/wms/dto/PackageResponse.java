package com.example.demo.integration.wms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PackageResponse {
    private Long orderId;
    private Long packageId;
    private String status;
    private String warehouseLocation;
    private String pickedUpAt;
}
