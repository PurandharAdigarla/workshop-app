package com.aptr.workshop_backend.dto;

public record FeedbackDto(
        Long attendeeId,
        Long workshopId,
        Integer rating,
        String comment
) {}

