package com.assignment_4.SwiftLogistics.middleware.soap.endpoint;

import com.assignment_4.SwiftLogistics.domain.repositories.OrderRepository;
import com.assignment_4.SwiftLogistics.middleware.kafka.MiddlewareEventPublisher;
import com.assignment_4.SwiftLogistics.wsdl.CreateOrderRequest;
import com.assignment_4.SwiftLogistics.wsdl.CreateOrderResponse;
import com.assignment_4.SwiftLogistics.wsdl.GetOrderStatusRequest;
import com.assignment_4.SwiftLogistics.wsdl.GetOrderStatusResponse;
import org.springframework.ws.server.endpoint.annotation.*;

import java.util.UUID;

@Endpoint
public class MiddlewareEndpoint {

    private static final String NAMESPACE_URI = "http://swiftlogistics.com/cms";

    private final MiddlewareEventPublisher publisher;
    private final OrderRepository orderRepository;

    public MiddlewareEndpoint(MiddlewareEventPublisher publisher, OrderRepository orderRepository) {
        this.publisher = publisher;
        this.orderRepository = orderRepository;
    }

    /**
     * Middleware requirement: SOAP/XML -> JSON -> Kafka
     */
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "CreateOrderRequest")
    @ResponsePayload
    public CreateOrderResponse createOrder(@RequestPayload CreateOrderRequest request) {
        String orderId = UUID.randomUUID().toString();

        publisher.publishOrderCreated(
                orderId,
                request.getContractId(),
                request.getClientId(),
                request.getItems(),
                request.getDeliveryAddress()
        );

        CreateOrderResponse response = new CreateOrderResponse();
        response.setSuccess(true);
        response.setOrderId(orderId);
        response.setMessage("Submitted to Kafka (JSON event). Call GetOrderStatus with orderId.");
        return response;
    }

    /**
     * Persistent status: read from DB after CMS records the order.
     * CMS uses order.setOrderNo(event.orderId()) in CmsSagaService.
     */
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "GetOrderStatusRequest")
    @ResponsePayload
    public GetOrderStatusResponse getOrderStatus(@RequestPayload GetOrderStatusRequest request) {
        String externalOrderId = request.getOrderId();

        GetOrderStatusResponse response = new GetOrderStatusResponse();
        response.setOrderId(externalOrderId);

        return orderRepository.findByOrderNo(externalOrderId)
                .map(order -> {
                    response.setSuccess(true);
                    response.setStatus(order.getOrderStatus());
                    response.setMessage("Order found");
                    return response;
                })
                .orElseGet(() -> {
                    response.setSuccess(false);
                    response.setStatus("PENDING");
                    response.setMessage("Order not recorded yet (processing) or invalid orderId");
                    return response;
                });
    }
}