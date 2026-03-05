package com.example.demo.controller;

import com.example.demo.integration.ros.dto.RouteOptimizeRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/apiroutes")
public class ApiController {
    @PostMapping("/optimize")
    public String optimizedRoute(@RequestBody RouteOptimizeRequest request){
        return "optimized";
    }
}
