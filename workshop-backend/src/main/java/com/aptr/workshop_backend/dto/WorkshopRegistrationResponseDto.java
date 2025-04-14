package com.aptr.workshop_backend.dto;

import java.time.LocalDateTime;

public record WorkshopRegistrationResponseDto(
        Long registerId,
        Long attendeeId,
        Long workshopId,
        LocalDateTime registrationTime,
        Boolean attended
) {}
