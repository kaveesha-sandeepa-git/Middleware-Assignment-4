package com.assignment_4.SwiftLogistics.services;

import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import com.assignment_4.SwiftLogistics.wsdl.*;

@Endpoint
public class CmsEndpoint {

    private static final String NAMESPACE_URI = "http://swiftlogistics.com/cms";

    private final OrderService orderService;

    public CmsEndpoint(OrderService orderService) {
        this.orderService = orderService;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "CreateOrderRequest")
    @ResponsePayload
    public CreateOrderResponse createOrder(@RequestPayload CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "GetOrderStatusRequest")
    @ResponsePayload
    public GetOrderStatusResponse getOrderStatus(@RequestPayload GetOrderStatusRequest request) {
        return orderService.getOrderStatus(request);
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "UpdateOrderStatusRequest")
    @ResponsePayload
    public UpdateOrderStatusResponse updateOrderStatus(@RequestPayload UpdateOrderStatusRequest request) {
        return orderService.UpdateOrderStatus(request);
    }
}