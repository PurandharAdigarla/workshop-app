package com.aptr.workshop_backend.repository;

import com.aptr.workshop_backend.dto.AttendeeResponseDto;
import com.aptr.workshop_backend.entity.AttendeeWorkshopRegistration;
import com.aptr.workshop_backend.enums.WorkshopState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AttendeeWorkshopRegistrationRepo extends JpaRepository<AttendeeWorkshopRegistration, Long> {

    @Query("SELECT new com.aptr.workshop_backend.dto.AttendeeResponseDto(" +
            "a.attendeeName, a.attendeeEmail, a.attendeePhoneNumber) " +
            "FROM AttendeeWorkshopRegistration r " +
            "JOIN r.attendee a " +
            "WHERE r.workshop.workshopId = :workshopId")
    List<AttendeeResponseDto> findAttendeesByWorkshopId(@Param("workshopId") Long workshopId);

    boolean existsByAttendee_AttendeeIdAndWorkshop_WorkshopId(Long attendeeId, Long workshopId);

    List<AttendeeWorkshopRegistration> findByAttendee_AttendeeId(Long attendeeId);

    Optional<AttendeeWorkshopRegistration> findByAttendee_AttendeeIdAndWorkshop_WorkshopId(Long attendeeId, Long workshopId);

    @Query("SELECT r FROM AttendeeWorkshopRegistration r WHERE r.attendee.attendeeId = :attendeeId AND r.workshop.workshopState = :state AND (r.feedbackGiven IS NULL OR r.feedbackGiven = false)")
    List<AttendeeWorkshopRegistration> findPendingFeedbacks(@Param("attendeeId") Long attendeeId,
                                                            @Param("state") WorkshopState state);

    @Query("SELECT r FROM AttendeeWorkshopRegistration r WHERE r.attendee.attendeeId = :attendeeId AND r.attended = true")
    List<AttendeeWorkshopRegistration> findAttendedWorkshopsByAttendeeId(@Param("attendeeId") Long attendeeId);
    
    @Query("SELECT r FROM AttendeeWorkshopRegistration r " +
           "WHERE r.feedbackGiven = true " +
           "AND r.workshop.workshopId = :workshopId")
    List<AttendeeWorkshopRegistration> findFeedbacksByWorkshopId(@Param("workshopId") Long workshopId);
    
    @Query("SELECT DISTINCT r.workshop.workshopId FROM AttendeeWorkshopRegistration r " +
           "WHERE r.feedbackGiven = true")
    List<Long> findWorkshopIdsWithFeedback();
    
    @Query("SELECT AVG(r.rating) FROM AttendeeWorkshopRegistration r " +
           "WHERE r.workshop.workshopId = :workshopId AND r.feedbackGiven = true")
    Double getAverageRatingForWorkshop(@Param("workshopId") Long workshopId);
}

