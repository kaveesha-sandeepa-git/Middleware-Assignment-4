package com.swiftlogistics.wms.tcp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response sent from WMS to Middleware over TCP.
 * Follows a simple request–response protocol.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TcpResponse {

    /**
     * Operation result.
     * Possible values: SUCCESS, ERROR
     */
    private String status;

    /**
     * Human-readable message describing the result.
     */
    private String message;

    /**
     * Related order ID.
     */
    private String orderId;

    /**
     * Generated package ID (if applicable).
     */
    private String packageId;

    /**
     * Current package lifecycle status.
     * Example: RECEIVED, SORTED, LOADED, CANCELLED
     */
    private String packageStatus;
}