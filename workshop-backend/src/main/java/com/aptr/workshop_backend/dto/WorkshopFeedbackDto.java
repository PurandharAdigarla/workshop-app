package com.aptr.workshop_backend.dto;

import java.time.LocalDate;
import java.util.List;

public record WorkshopFeedbackDto(
    Long workshopId,
    String workshopTitle,
    LocalDate startDate,
    LocalDate endDate,
    Double averageRating,
    Integer totalFeedbacks,
    List<FeedbackDetailsDto> feedbacks
) {} 