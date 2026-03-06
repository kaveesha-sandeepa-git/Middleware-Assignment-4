package com.assignment_4.SwiftLogistics.api.orders;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrdersService {

    // TODO: replace with JPA repository that reads/writes your orders table
    private final InMemoryOrdersStore store = new InMemoryOrdersStore();

    public List<OrderDto> listOrdersForCurrentClient() {
        return store.list();
    }

    public CreateOrderResult createOrder(CreateOrderRequest req) {
        String orderId = UUID.randomUUID().toString();

        String address = "%s, %s, %s %s".formatted(
                req.deliveryAddress().street(),
                req.deliveryAddress().city(),
                req.deliveryAddress().state(),
                req.deliveryAddress().zipCode()
        );

        store.add(new OrderDto(
                orderId,
                req.customerName(),
                req.customerEmail(),
                address,
                "pending",
                Instant.now().toString()
        ));

        // TODO: publish to Kafka / call your SOAP create order logic here

        return new CreateOrderResult(orderId, "pending");
    }

    public OrderDto getOrder(String id) {
        return store.get(id);
    }

    // simple demo store (replace with DB/JPA)
    static class InMemoryOrdersStore {
        private final List<OrderDto> orders = new ArrayList<>();
        List<OrderDto> list() { return orders; }
        void add(OrderDto o) { orders.add(0, o); }
        OrderDto get(String id) {
            return orders.stream().filter(o -> o.id().equals(id)).findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        }
    }
}