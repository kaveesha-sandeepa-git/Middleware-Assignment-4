package com.swiftlogistics.wms.tcp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TcpRequest {

    /**
     * Command type sent by Middleware
     * Example:
     * CREATE_PACKAGE
     * CANCEL_PACKAGE
     */
    @NotBlank
    private String command;

    /**
     * Order ID (Required for most operations)
     */
    private String orderId;

    /**
     * Client ID (Required for CREATE_PACKAGE)
     */
    private String clientId;

    /**
     * Delivery Address (Required for CREATE_PACKAGE)
     */
    private String deliveryAddress;
}