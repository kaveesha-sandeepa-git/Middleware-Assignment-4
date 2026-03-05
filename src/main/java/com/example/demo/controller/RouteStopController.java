package com.example.demo.controller;

import com.example.demo.model.Route;
import com.example.demo.model.RouteStop;
import com.example.demo.service.RouteService;
import com.example.demo.service.RouteStopService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routeStops")
public class RouteStopController {
    private final RouteStopService routeStopService;

    public RouteStopController(RouteStopService routeStopService) {
        this.routeStopService = routeStopService;
    }

    @PostMapping
    public RouteStop createDelivery(@RequestBody RouteStop routeStop) {
        return routeStopService.saveRouteStop(routeStop);
    }

    @GetMapping
    public List<RouteStop> getRouteStops() {
        return routeStopService.getAllRouteStops();
    }
}
