package com.aptr.workshop_backend.dto;

public record FeedbackDetailsDto(
    String attendeeName,
    Integer rating,
    String comment
) {} 