package com.assignment_4.SwiftLogistics.services;

import com.assignment_4.SwiftLogistics.services.entities.Contracts;
import com.assignment_4.SwiftLogistics.services.entities.Order;
import com.assignment_4.SwiftLogistics.services.repositories.ContractRepository;
import com.assignment_4.SwiftLogistics.services.repositories.OrderRepository;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.stereotype.Service;
import com.assignment_4.SwiftLogistics.wsdl.*;

import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final ContractRepository contractRepo;

    public OrderService(OrderRepository orderRepo, ContractRepository contractRepo) {
        this.orderRepo = orderRepo;
        this.contractRepo = contractRepo;
    }

    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        CreateOrderResponse response = new CreateOrderResponse();

        UUID contractId;
        try {
            contractId = UUID.fromString(request.getContractId());
        } catch (IllegalArgumentException e) {
            response.setSuccess(false);
            response.setOrderId("");
            response.setMessage("Invalid contractId format");
            return response;
        }

        Optional<Contracts> contractOpt = contractRepo.findById(contractId);
        if (contractOpt.isEmpty()) {
            response.setSuccess(false);
            response.setOrderId("");
            response.setMessage("Contract not found");
            return response;
        }

        String generateOrderNo = UUID.randomUUID().toString();

        BigDecimal amount = BigDecimal.ZERO;

        Order order = new Order();
        order.setOrderNo(generateOrderNo);
        order.setOrderAmount(amount);
        order.setOrderStatus("created");
        order.setContracts(contractOpt.get());
        Order savedOrder = orderRepo.save(order);

        response.setSuccess(true);
        response.setOrderId(savedOrder.getOrderId().toString());
        response.setMessage("Order created successfully");
        return response;


    }

    public GetOrderStatusResponse getOrderStatus(GetOrderStatusRequest request) {
        GetOrderStatusResponse response = new GetOrderStatusResponse();
        response.setOrderId(request.getOrderId());

        UUID orderId;
        try {
            orderId = UUID.fromString(request.getOrderId());
        } catch (IllegalArgumentException e) {
            response.setSuccess(false);
            response.setStatus("Unknown Order Id");
            response.setMessage("Invalid Order Id");
            return response;
        }

        Optional<String> statusOpt = orderRepo.findStatusByOrderId(orderId);
        if (statusOpt.isPresent()) {
            response.setSuccess(true);
            response.setStatus(statusOpt.get());
            response.setMessage("Order Status found");
            return response;
        }
        response.setSuccess(false);
        response.setStatus("Unknown Order status");
        response.setMessage("invalid order status");
        return response;

    }
    public UpdateOrderStatusResponse UpdateOrderStatus(UpdateOrderStatusRequest request){
            UpdateOrderStatusResponse response = new UpdateOrderStatusResponse();
            UUID orderId;
            try{
                orderId = UUID.fromString(request.getOrderId());
            }
            catch (IllegalArgumentException e){
                response.setSuccess(false);
                response.setMessage("Invalid Order Id");
                return response;
            }

            int updateRow = orderRepo.updateStatus(orderId,request.getStatus());
            boolean updated =  updateRow > 0;

            response.setSuccess(updated);
            response.setMessage(updated ? "status updated" : "Order not found");
            return response;
    }


}