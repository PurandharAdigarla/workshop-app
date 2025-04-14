package com.aptr.workshop_backend.repository;

import com.aptr.workshop_backend.entity.Attendee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendeeRepo extends JpaRepository<Attendee, Long> {
    Optional<Attendee> findByAttendeeEmail(String attendeeEmail);
    Optional<Attendee> findByAttendeePhoneNumber(String attendeePhoneNumber);
    boolean existsByAttendeeEmail(String attendeeEmail);
    boolean existsByAttendeePhoneNumber(String attendeePhoneNumber);
}
