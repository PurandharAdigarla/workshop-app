package com.aptr.workshop_backend.controller;

import com.aptr.workshop_backend.dto.*;
import com.aptr.workshop_backend.entity.Workshop;
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
    public ResponseEntity<String> registerAttendee(@RequestBody WorkshopRegistrationRequestDto dto) {
        String response = workshopService.registerAttendeeToWorkshop(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/deregister")
    public ResponseEntity<String> deregisterAttendee(@RequestBody WorkshopRegistrationRequestDto dto) {
        String response = workshopService.deregisterAttendeeFromWorkshop(dto);
        if (response.equals("Deregistration successful") || response.equals("De-registration successful")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/submit-feedback")
    public ResponseEntity<String> submitFeedback(@RequestBody FeedbackDto dto) {
        String response = workshopService.submitFeedback(dto);
        if (response.equals("Feedback submitted successfully")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
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
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> editWorkshop(@PathVariable Long workshopId, @RequestBody WorkshopDto workshopDto)
    {
        if (workshopDto == null) {
            return ResponseEntity.badRequest().body("Workshop data is required");
        }
        
        System.out.println("Edit workshop request for ID: " + workshopId);
        System.out.println("Request data: " + workshopDto);
        
        String result = workshopService.editWorkshop(workshopId, workshopDto);
        
        if (result.startsWith("Error") || result.contains("not found") || result.contains("cannot be")) {
            return ResponseEntity.badRequest().body(result);
        }
        
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{workshopId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> softDeleteWorkshop(@PathVariable Long workshopId) {
        return ResponseEntity.ok(workshopService.softDeleteWorkshop(workshopId));
    }

    @GetMapping("/{workshopId}/registrations")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ResponseDto<List<AttendeeResponseDto>>> getWorkshopRegistrations(@PathVariable Long workshopId) {
        List<AttendeeResponseDto> registrations = workshopService.getRegistrationsByWorkshopId(workshopId);
        ResponseDto<List<AttendeeResponseDto>> response = new ResponseDto<>(registrations.size(), registrations);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllWorkshopFeedbacks() {
        try {
            List<WorkshopFeedbackDto> feedbacks = workshopService.getAllWorkshopFeedbacks();
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error retrieving feedbacks: " + e.getMessage());
        }
    }

    @GetMapping("/feedback/{workshopId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getWorkshopFeedback(@PathVariable Long workshopId) {
        try {
            WorkshopFeedbackDto feedback = workshopService.getWorkshopFeedback(workshopId);
            if (feedback == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error retrieving workshop feedback: " + e.getMessage());
        }
    }
}

