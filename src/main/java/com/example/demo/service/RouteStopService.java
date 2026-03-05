package com.example.demo.service;

import com.example.demo.model.RouteStop;
import com.example.demo.repository.RouteStopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteStopService {

    private final RouteStopRepository routeStopRepository;

    public RouteStopService(RouteStopRepository routeStopRepository) {
        this.routeStopRepository = routeStopRepository;
    }

    public RouteStop saveRouteStop(RouteStop routeStop){
        return routeStopRepository.save(routeStop);
    }

    public List<RouteStop> getAllRouteStops(){
        return routeStopRepository.findAll();
    }
}
