package com.example.demo.controller;

import com.example.demo.model.Route;
import com.example.demo.service.RouteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping
    public Route createDelivery(@RequestBody Route route) {
        return routeService.saveRoute(route);
    }

    @GetMapping
    public List<Route> getRoutes() {
        return routeService.getAllRoutes();
    }
}
