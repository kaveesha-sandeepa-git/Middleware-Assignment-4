package com.example.demo.service;

import com.example.demo.model.Route;
import com.example.demo.repository.RouteRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class RouteService {
    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public Route saveRoute(Route route) {
        log.info("Saving route with optimizedRouteId: {}", route.getOptimizedRouteId());
        return routeRepository.save(route);
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public Route getRouteById(Long id) {
        return routeRepository.findById(id).orElse(null);
    }

    public void updateRouteStatus(Long routeId, String status) {
        Route route = routeRepository.findById(routeId).orElse(null);
        if (route != null) {
            route.setStatus(status);
            routeRepository.save(route);
            log.info("Updated route {} status to {}", routeId, status);
        }
    }
}
