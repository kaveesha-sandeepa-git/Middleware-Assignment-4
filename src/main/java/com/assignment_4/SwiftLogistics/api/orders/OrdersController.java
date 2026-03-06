package com.assignment_4.SwiftLogistics.api.orders;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrdersController {

    private final OrdersService ordersService;

    public OrdersController(OrdersService ordersService) {
        this.ordersService = ordersService;
    }

    @GetMapping
    public Map<String, Object> list() {
        List<OrderDto> orders = ordersService.listOrdersForCurrentClient();
        return Map.of("orders", orders);
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody CreateOrderRequest req) {
        CreateOrderResult result = ordersService.createOrder(req);
        return Map.of("orderId", result.orderId(), "status", result.status());
    }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable String id) {
        return ordersService.getOrder(id);
    }
}