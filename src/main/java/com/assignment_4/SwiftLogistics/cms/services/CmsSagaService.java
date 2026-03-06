package com.assignment_4.SwiftLogistics.cms.services;

import com.assignment_4.SwiftLogistics.cms.kafka.events.OrderCreatedEvent;
import com.assignment_4.SwiftLogistics.domain.entities.Contracts;
import com.assignment_4.SwiftLogistics.domain.entities.Order;
import com.assignment_4.SwiftLogistics.domain.repositories.ContractRepository;
import com.assignment_4.SwiftLogistics.domain.repositories.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
public class CmsSagaService {

    private final OrderRepository orderRepository;
    private final ContractRepository contractRepository;

    public CmsSagaService(OrderRepository orderRepository, ContractRepository contractRepository) {
        this.orderRepository = orderRepository;
        this.contractRepository = contractRepository;
    }

    @Transactional
    public Order validateAndRecord(OrderCreatedEvent event) {
        UUID contractId;
        try {
            contractId = UUID.fromString(event.contractId());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid contractId format: " + event.contractId());
        }

        Optional<Contracts> contractOpt = contractRepository.findById(contractId);
        if (contractOpt.isEmpty()) {
            throw new IllegalStateException("Contract not found: " + event.contractId());
        }

        Optional<Order> existing = orderRepository.findByOrderNo(event.orderId());
        if (existing.isPresent()) {
            return existing.get();
        }

        Order order = new Order();
        order.setOrderNo(event.orderId());       // external id stored here
        order.setOrderAmount(BigDecimal.ZERO);
        order.setOrderStatus("validated");
        order.setContracts(contractOpt.get());

        return orderRepository.save(order);
    }
}