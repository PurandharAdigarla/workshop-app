package com.aptr.workshop_backend.dto;

public record AttendeeRegisterDto(
        String attendeeName,
        String attendeeEmail,
        String attendeePhoneNumber,
        String attendeePassword
) {}

