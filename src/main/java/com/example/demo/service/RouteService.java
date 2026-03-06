package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.model.Route;
import com.example.demo.repository.RouteRepository;

import lombok.extern.slf4j.Slf4j;

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

    public Optional<Route> findLatestByDeliveryId(Long deliveryId) {
        return routeRepository.findFirstByDeliveryId_IdOrderByCreatedAtDesc(deliveryId);
    }

    public List<Route> findAllOptimizedRoutes() {
        return routeRepository.findByOptimizedRouteIdIsNotNull();
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
