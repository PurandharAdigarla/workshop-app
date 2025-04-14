package com.aptr.workshop_backend.dto;

import java.time.LocalDate;
import java.util.List;

public record WorkshopDto(
        Long workshopId,
     String workshopTitle,
     String workshopTopic,
     List<String> workshopTutors,
     String workshopObjective,
     String workshopDescription,
     String workshopInstructions,
     LocalDate startDate,
     LocalDate endDate) {
}
