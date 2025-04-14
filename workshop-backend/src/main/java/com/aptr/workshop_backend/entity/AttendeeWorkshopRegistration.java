package com.aptr.workshop_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "attendee_workshop_registrations")
public class AttendeeWorkshopRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long registerId;

    @ManyToOne
    @JoinColumn(name = "attendee_id", nullable = false)
    private Attendee attendee;

    @ManyToOne
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    @Column(name = "registration_time", nullable = false)
    private Date registrationTime;

    @Column(name = "attended")
    private Boolean attended = false;

    @Column(name = "feedback_given")
    private Boolean feedbackGiven = false;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "comment", length = 1000)
    private String comment;
}
