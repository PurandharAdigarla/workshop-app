package com.aptr.workshop_backend.dto;

public record AccessTokenDto(String accessToken, Long adminId) {
    // Constructor with just accessToken for backward compatibility
    public AccessTokenDto(String accessToken) {
        this(accessToken, null);
    }
}
