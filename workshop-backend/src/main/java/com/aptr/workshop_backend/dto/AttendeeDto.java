package com.aptr.workshop_backend.dto;

public record AttendeeDto(
    Long attendeeId, 
    String attendeeName, 
    String attendeeEmail, 
    String attendeePhoneNumber
) {}
