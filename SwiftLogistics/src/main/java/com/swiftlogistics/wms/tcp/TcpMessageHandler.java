package com.swiftlogistics.wms.tcp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swiftlogistics.wms.entity.PackageEntity;
import com.swiftlogistics.wms.service.PackageService;
import com.swiftlogistics.wms.tcp.dto.TcpRequest;
import com.swiftlogistics.wms.tcp.dto.TcpResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TcpMessageHandler {

    private final PackageService service;
    private final ObjectMapper mapper = new ObjectMapper();

    @ServiceActivator(inputChannel = "requestChannel",
                      outputChannel = "replyChannel")
    public byte[] handle(byte[] message) {

        try {

            String json = new String(message).trim();
            log.info("Received TCP request: {}", json);

            TcpRequest request =
                    mapper.readValue(json, TcpRequest.class);

            TcpResponse response;

            switch (request.getCommand()) {

                case "CREATE_PACKAGE":
                    response = handleCreate(request);
                    break;

                case "CANCEL_PACKAGE":
                    response = handleCancel(request);
                    break;

                default:
                    response = TcpResponse.builder()
                            .status("ERROR")
                            .message("Unknown command")
                            .build();
            }

            return (mapper.writeValueAsString(response) + "\n").getBytes();

        } catch (Exception ex) {

            log.error("TCP processing failed", ex);

            try {
                TcpResponse errorResponse = TcpResponse.builder()
                        .status("ERROR")
                        .message(ex.getMessage())
                        .build();

                return (mapper.writeValueAsString(errorResponse) + "\n").getBytes();
            } catch (Exception e) {
                return "{\"status\":\"ERROR\",\"message\":\"Internal error\"}\n"
                        .getBytes();
            }
        }
    }

    private TcpResponse handleCreate(TcpRequest request) {

        PackageEntity pkg = service.createPackage(
                request.getOrderId(),
                request.getClientId(),
                request.getDeliveryAddress()
        );

        return TcpResponse.builder()
                .status("SUCCESS")
                .message("Package created successfully")
                .orderId(pkg.getOrderId())
                .packageId(pkg.getId())
                .packageStatus(pkg.getStatus().name())
                .build();
    }

    private TcpResponse handleCancel(TcpRequest request) {

        PackageEntity pkg =
                service.cancelPackage(request.getOrderId());

        return TcpResponse.builder()
                .status("SUCCESS")
                .message("Package cancelled successfully")
                .orderId(pkg.getOrderId())
                .packageId(pkg.getId())
                .packageStatus(pkg.getStatus().name())
                .build();
    }
}