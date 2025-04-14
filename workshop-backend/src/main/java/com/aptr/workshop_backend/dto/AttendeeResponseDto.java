package com.aptr.workshop_backend.dto;

public record AttendeeResponseDto(
        String attendeeName,
        String attendeeEmail,
        String attendeePhoneNumber
) {
}