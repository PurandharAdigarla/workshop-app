package com.aptr.workshop_backend.controller;

import com.aptr.workshop_backend.dto.*;
import com.aptr.workshop_backend.entity.Workshop;
import com.aptr.workshop_backend.exception.ResourceNotFoundException;
import com.aptr.workshop_backend.service.WorkshopService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workshop")
@Slf4j
public class WorkshopController {
    private final WorkshopService workshopService;

    @PostMapping
    public ResponseEntity<String> addWorkshop(@RequestBody Workshop workshop) {
        return ResponseEntity.ok(workshopService.addWorkshop(workshop));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Workshop>> upcomingWorkshops() {
        return ResponseEntity.ok(workshopService.upcomingWorkshops());
    }

    @GetMapping("/ongoing")
    public ResponseEntity<List<Workshop>> ongoingWorkshops() {
        return ResponseEntity.ok(workshopService.ongoingWorkshops());
    }

    @GetMapping("/completed")
    public ResponseEntity<List<Workshop>> completedWorkshops() {
        return ResponseEntity.ok(workshopService.completedWorkshops());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerAttendee(@RequestBody WorkshopRegistrationRequestDto dto) {
        try {
            String response = workshopService.registerAttendeeToWorkshop(dto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
        }
    }

    @DeleteMapping("/deregister")
    public ResponseEntity<?> deregisterAttendee(@RequestBody WorkshopRegistrationRequestDto dto) {
        try {
            String response = workshopService.deregisterAttendeeFromWorkshop(dto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
        }
    }

    @PostMapping("/submit-feedback")
    public ResponseEntity<String> submitFeedback(@RequestBody FeedbackDto dto) {
        String response = workshopService.submitFeedback(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-feedbacks/{attendeeId}")
    public ResponseEntity<List<WorkshopDto>> getPendingFeedbacks(@PathVariable Long attendeeId) {
        return ResponseEntity.ok(workshopService.getPendingFeedbacks(attendeeId));
    }

    @GetMapping("/attended/{attendeeId}")
    public ResponseEntity<List<WorkshopDto>> attendeeAttendedWorkshops(@PathVariable Long attendeeId) {
        return ResponseEntity.ok(workshopService.getAttendedWorkshopsByAttendee(attendeeId));
    }

    @GetMapping("/registered/{attendeeId}")
    public ResponseEntity<List<WorkshopDto>> attendeeRegisteredWorkshops(@PathVariable Long attendeeId) {
        return ResponseEntity.ok(workshopService.getRegisteredWorkshopsByAttendee(attendeeId));
    }

    @PatchMapping("/{workshopId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> editWorkshop(@PathVariable Long workshopId, @RequestBody WorkshopDto workshopDto) {
        return ResponseEntity.ok(workshopService.editWorkshop(workshopId, workshopDto));
    }

    @DeleteMapping("/{workshopId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> softDeleteWorkshop(@PathVariable Long workshopId) {
        return ResponseEntity.ok(workshopService.softDeleteWorkshop(workshopId));
    }

    @GetMapping("/{workshopId}/registrations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDto<List<AttendeeResponseDto>>> getWorkshopRegistrations(@PathVariable Long workshopId) {
        List<AttendeeResponseDto> registrations = workshopService.getRegistrationsByWorkshopId(workshopId);
        ResponseDto<List<AttendeeResponseDto>> response = new ResponseDto<>(registrations.size(), registrations);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WorkshopFeedbackDto>> getAllWorkshopFeedbacks() {
        List<WorkshopFeedbackDto> feedbacks = workshopService.getAllWorkshopFeedbacks();
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/feedback/{workshopId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkshopFeedbackDto> getWorkshopFeedback(@PathVariable Long workshopId) {
        WorkshopFeedbackDto feedback = workshopService.getWorkshopFeedback(workshopId);
        if (feedback == null) {
            throw new ResourceNotFoundException("Workshop feedback", "workshopId", workshopId);
        }
        return ResponseEntity.ok(feedback);
    }
}

