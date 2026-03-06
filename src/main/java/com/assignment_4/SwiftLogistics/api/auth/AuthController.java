package com.assignment_4.SwiftLogistics.api.auth;

import com.assignment_4.SwiftLogistics.domain.entities.Clients;
import com.assignment_4.SwiftLogistics.domain.repositories.ClientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ClientRepository clientsRepository;

    public AuthController(ClientRepository clientsRepository) {
        this.clientsRepository = clientsRepository;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Body is required");
        }
        if (req.name() == null || req.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }
        if (req.email() == null || req.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        String name = req.name().trim();
        String email = req.email().trim().toLowerCase();

        // Find existing client by email OR create new one
        Clients client = clientsRepository.findByClientEmail(email)
                .orElseGet(() -> clientsRepository.save(new Clients(name, email)));

        // Optional: keep name updated
        if (client.getClient_name() == null || !client.getClient_name().equals(name)) {
            client.setClientName(name);
            client = clientsRepository.save(client);
        }

        String token = UUID.randomUUID().toString();

        return new LoginResponse(
                token,
                new LoginResponse.UserDto(client.getClient_id(), client.getClient_email(), client.getClient_name())
        );
    }
}