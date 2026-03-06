package com.assignment_4.SwiftLogistics.api.auth;

import java.util.UUID;

public record LoginResponse(
        String token,
        UserDto user
) {
    public record UserDto(UUID clientId, String email, String name) {}
}