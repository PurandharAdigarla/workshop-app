package com.aptr.workshop_backend.entity;

import com.aptr.workshop_backend.enums.WorkshopState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Workshop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long workshopId;

    @Column(updatable = false)
    private LocalDate createdDate;

    private String workshopTopic;

    @ElementCollection
    @CollectionTable(name = "workshop_tutors", joinColumns = @JoinColumn(name = "workshop_id"))
    private List<String> workshopTutors;

    private String workshopTitle;
    private String workshopObjective;

    @Column(length = 1500)
    private String workshopDescription;
    @Column(length = 1000)
    private String workshopInstructions;

    private boolean isWorkshopDeleted = false;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private WorkshopState workshopState;

}
