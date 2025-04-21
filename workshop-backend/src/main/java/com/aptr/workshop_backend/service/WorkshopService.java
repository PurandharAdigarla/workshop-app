package com.aptr.workshop_backend.service;

import com.aptr.workshop_backend.dto.*;
import com.aptr.workshop_backend.entity.Attendee;
import com.aptr.workshop_backend.entity.AttendeeWorkshopRegistration;
import com.aptr.workshop_backend.entity.Workshop;
import com.aptr.workshop_backend.enums.WorkshopState;
import com.aptr.workshop_backend.exception.BadRequestException;
import com.aptr.workshop_backend.exception.ConflictException;
import com.aptr.workshop_backend.exception.ResourceNotFoundException;
import com.aptr.workshop_backend.mapper.WorkshopMapper;
import com.aptr.workshop_backend.mapper.AttendeeMapper;
import com.aptr.workshop_backend.repository.AttendeeRepo;
import com.aptr.workshop_backend.repository.AttendeeWorkshopRegistrationRepo;
import com.aptr.workshop_backend.repository.WorkshopRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkshopService {
    private final WorkshopRepo workshopRepo;
    private final AttendeeRepo attendeeRepo;
    private final AttendeeWorkshopRegistrationRepo attendeeWorkshopRegistrationRepo;
    private final WorkshopMapper workshopMapper;
    private final PasswordEncoder passwordEncoder;

    public String addWorkshop(Workshop workshop) {
        LocalDate currentDate = LocalDate.now();
        workshop.setCreatedDate(currentDate);

        if (workshop.getStartDate().isAfter(workshop.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }
        if (workshop.getStartDate().isBefore(currentDate) || workshop.getEndDate().isBefore(currentDate)) {
            throw new BadRequestException("Start and end dates must be in the future");
        }

        workshop.setWorkshopState(determineWorkshopState(workshop.getStartDate(), workshop.getEndDate()));
        Workshop savedWorkshop = workshopRepo.save(workshop);
        log.info("Workshop created successfully with ID: {}", savedWorkshop.getWorkshopId());
        return "New workshop created successfully";
    }

    public List<Workshop> upcomingWorkshops() {
        return workshopRepo.findByWorkshopStateAndIsWorkshopDeletedFalse(WorkshopState.UPCOMING);
    }

    public List<Workshop> ongoingWorkshops() {
        return workshopRepo.findByWorkshopStateAndIsWorkshopDeletedFalse(WorkshopState.ONGOING);
    }

    public List<Workshop> completedWorkshops() {
        return workshopRepo.findByWorkshopStateAndIsWorkshopDeletedFalse(WorkshopState.COMPLETED);
    }

    public String editWorkshop(Long workshopId, WorkshopDto workshopDto) {
        if (workshopDto == null) {
            throw new BadRequestException("Workshop data is required");
        }

        Workshop existingWorkshop = workshopRepo.findById(workshopId)
            .orElseThrow(() -> new ResourceNotFoundException("Workshop", "id", workshopId));
        
        LocalDate today = LocalDate.now();
    
        LocalDate oldStartDate = existingWorkshop.getStartDate();
        LocalDate oldEndDate = existingWorkshop.getEndDate();
        WorkshopState currentState = existingWorkshop.getWorkshopState();
        
        try {
            if (workshopDto.startDate() != null && workshopDto.endDate() != null) {
                if (workshopDto.endDate().isBefore(workshopDto.startDate())) {
                    throw new BadRequestException("End date must be after start date");
                }
                
                if (currentState == WorkshopState.ONGOING) {
                    if (!workshopDto.startDate().isEqual(oldStartDate)) {
                        throw new BadRequestException("Start date cannot be modified for ongoing workshops");
                    }
                    
                    if (workshopDto.endDate().isBefore(today)) {
                        throw new BadRequestException("End date must be today or later for ongoing workshops");
                    }
                }
                
                if (currentState == WorkshopState.UPCOMING) {
                    if (workshopDto.startDate().isBefore(today)) {
                        throw new BadRequestException("Start date must be today or later for upcoming workshops");
                    }
                    
                    if (workshopDto.endDate().isBefore(today)) {
                        throw new BadRequestException("End date must be today or later for upcoming workshops");
                    }
                }
                
                if (currentState == WorkshopState.COMPLETED) {
                    WorkshopState newState = determineWorkshopState(workshopDto.startDate(), workshopDto.endDate());
                    if (newState != WorkshopState.COMPLETED) {
                        throw new BadRequestException("Cannot change completed workshop to " + newState + " state");
                    }
                }
            } else if (workshopDto.startDate() != null) {
                if (currentState == WorkshopState.ONGOING) {
                    throw new BadRequestException("Start date cannot be modified for ongoing workshops");
                }
                
                if (currentState == WorkshopState.UPCOMING && workshopDto.startDate().isBefore(today)) {
                    throw new BadRequestException("Start date must be today or later for upcoming workshops");
                }
                
                if (workshopDto.startDate().isAfter(existingWorkshop.getEndDate())) {
                    throw new BadRequestException("Start date cannot be after existing end date");
                }
            } else if (workshopDto.endDate() != null) {
                if (workshopDto.endDate().isBefore(existingWorkshop.getStartDate())) {
                    throw new BadRequestException("End date cannot be before existing start date");
                }
                
                if ((currentState == WorkshopState.ONGOING || currentState == WorkshopState.UPCOMING) && 
                     workshopDto.endDate().isBefore(today)) {
                    throw new BadRequestException("End date must be today or later for " + currentState.toString().toLowerCase() + " workshops");
                }
            }
            
            workshopMapper.updateWorkshopFromDto(workshopDto, existingWorkshop);
            
            if ((workshopDto.startDate() != null && !existingWorkshop.getStartDate().equals(oldStartDate)) ||
                (workshopDto.endDate() != null && !existingWorkshop.getEndDate().equals(oldEndDate))) {
                WorkshopState newState = determineWorkshopState(existingWorkshop.getStartDate(), existingWorkshop.getEndDate());
                existingWorkshop.setWorkshopState(newState);
            }
            
            workshopRepo.save(existingWorkshop);
            return "Workshop updated successfully";
        } catch (Exception e) {
            throw new BadRequestException("Error updating workshop: " + e.getMessage());
        }
    }

    public String registerAttendeeToWorkshop(WorkshopRegistrationRequestDto dto) {
        Attendee attendee = attendeeRepo.findById(dto.attendeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendee", "id", dto.attendeeId()));
        
        Workshop workshop = workshopRepo.findById(dto.workshopId())
                .orElseThrow(() -> new ResourceNotFoundException("Workshop", "id", dto.workshopId()));

        if (workshop.getWorkshopState() == WorkshopState.COMPLETED) {
            throw new BadRequestException("Cannot register for a completed workshop");
        }
        
        boolean alreadyRegistered = attendeeWorkshopRegistrationRepo
                .existsByAttendee_AttendeeIdAndWorkshop_WorkshopId(dto.attendeeId(), dto.workshopId());
        
        if (alreadyRegistered) {
            throw new ConflictException("Registration", "workshop", dto.workshopId());
        }
        
        try {
            AttendeeWorkshopRegistration registration = new AttendeeWorkshopRegistration();
            registration.setAttendee(attendee);
            registration.setWorkshop(workshop);
            registration.setRegistrationTime(new Date());

            attendeeWorkshopRegistrationRepo.save(registration);
            log.info("Attendee {} successfully registered for workshop {}", dto.attendeeId(), dto.workshopId());
            return "Registration successful";
        } catch (Exception e) {
            log.error("Error during workshop registration: {}", e.getMessage());
            throw new BadRequestException("Registration failed: " + e.getMessage());
        }
    }

    public String deregisterAttendeeFromWorkshop(WorkshopRegistrationRequestDto dto) {
        AttendeeWorkshopRegistration registration = attendeeWorkshopRegistrationRepo
                .findByAttendee_AttendeeIdAndWorkshop_WorkshopId(dto.attendeeId(), dto.workshopId())
                .orElseThrow(() -> new ResourceNotFoundException("Registration", "attendee and workshop", 
                    dto.attendeeId() + " and " + dto.workshopId()));
        
        Workshop workshop = registration.getWorkshop();
        if (workshop.getWorkshopState() == WorkshopState.COMPLETED) {
            throw new BadRequestException("Cannot deregister from a completed workshop");
        }
        
        try {
            attendeeWorkshopRegistrationRepo.delete(registration);
            log.info("Attendee {} successfully deregistered from workshop {}", dto.attendeeId(), dto.workshopId());
            return "Deregistration successful";
        } catch (Exception e) {
            log.error("Error during workshop deregistration: {}", e.getMessage());
            throw new BadRequestException("Deregistration failed: " + e.getMessage());
        }
    }

    public String softDeleteWorkshop(Long workshopId) {
        Optional<Workshop> optional = workshopRepo.findById(workshopId);
        if (optional.isEmpty()) {
            throw new ResourceNotFoundException("Workshop", "id", workshopId);
        }
        Workshop workshop = optional.get();
        if (workshop.isWorkshopDeleted()) {
            throw new ConflictException("Workshop", "id", workshopId);
        }
        workshop.setWorkshopDeleted(true);
        workshopRepo.save(workshop);
        log.info("Workshop with ID: {} soft deleted successfully", workshopId);
        return "Workshop soft deleted successfully";
    }

    public List<AttendeeResponseDto> getRegistrationsByWorkshopId(Long workshopId) {
        return attendeeWorkshopRegistrationRepo.findAttendeesByWorkshopId(workshopId);
    }

    private WorkshopState determineWorkshopState(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();

        if (startDate.isAfter(today)) {
            return WorkshopState.UPCOMING;
        } else if ((startDate.isEqual(today) || startDate.isBefore(today)) &&
                (endDate.isEqual(today) || endDate.isAfter(today))) {
            return WorkshopState.ONGOING;
        } else {
            return WorkshopState.COMPLETED;
        }
    }

    public List<WorkshopDto> getRegisteredWorkshopsByAttendee(Long attendeeId) {
        List<AttendeeWorkshopRegistration> registrations = attendeeWorkshopRegistrationRepo.findByAttendee_AttendeeId(attendeeId);

        return registrations.stream()
                .map(reg -> workshopMapper.workshopToWorkshopDto(reg.getWorkshop()))
                .toList();

    }

    public String submitFeedback(FeedbackDto dto) {
        AttendeeWorkshopRegistration registration = attendeeWorkshopRegistrationRepo
            .findByAttendee_AttendeeIdAndWorkshop_WorkshopId(dto.attendeeId(), dto.workshopId())
            .orElseThrow(() -> new ResourceNotFoundException("Registration", 
                "attendee and workshop", dto.attendeeId() + " and " + dto.workshopId()));

        if (registration.getFeedbackGiven() != null && registration.getFeedbackGiven()) {
            throw new ConflictException("Feedback has already been submitted");
        }

        Workshop workshop = registration.getWorkshop();
        if (workshop.getWorkshopState() != WorkshopState.COMPLETED) {
            throw new BadRequestException("Cannot submit feedback until the workshop is completed");
        }

        if (dto.rating() == null || dto.rating() < 0 || dto.rating() > 5) {
            throw new BadRequestException("Rating must be between 0 and 5");
        }
        
        registration.setRating(dto.rating());
        registration.setComment(dto.comment());
        registration.setFeedbackGiven(true);
        registration.setAttended(true);
        attendeeWorkshopRegistrationRepo.save(registration);
        return "Feedback submitted successfully";
    }

    public List<WorkshopDto> getPendingFeedbacks(Long attendeeId) {
        List<AttendeeWorkshopRegistration> registrations =
                attendeeWorkshopRegistrationRepo.findPendingFeedbacks(attendeeId, WorkshopState.COMPLETED);

        return registrations.stream()
                .map(reg -> workshopMapper.workshopToWorkshopDto(reg.getWorkshop()))
                .collect(Collectors.toList());
    }

    public List<WorkshopDto> getAttendedWorkshopsByAttendee(Long attendeeId) {
        List<AttendeeWorkshopRegistration> registrations =
                attendeeWorkshopRegistrationRepo.findAttendedWorkshopsByAttendeeId(attendeeId);

        return registrations.stream()
                .map(reg -> workshopMapper.workshopToWorkshopDto(reg.getWorkshop()))
                .collect(Collectors.toList());
    }

    public List<WorkshopFeedbackDto> getAllWorkshopFeedbacks() {
        List<Long> workshopIds = attendeeWorkshopRegistrationRepo.findWorkshopIdsWithFeedback();
        
        return workshopIds.stream()
            .map(this::getWorkshopFeedback)
            .filter(dto -> dto != null)
            .collect(Collectors.toList());
    }
    
    public WorkshopFeedbackDto getWorkshopFeedback(Long workshopId) {
        Optional<Workshop> workshopOpt = workshopRepo.findById(workshopId);
        
        if (workshopOpt.isEmpty()) {
            return null;
        }
        
        Workshop workshop = workshopOpt.get();
        Double avgRating = attendeeWorkshopRegistrationRepo.getAverageRatingForWorkshop(workshopId);
        
        if (avgRating == null) {
            return new WorkshopFeedbackDto(
                workshopId,
                workshop.getWorkshopTitle(),
                workshop.getStartDate(),
                workshop.getEndDate(),
                0.0,
                0,
                List.of()
            );
        }
        
        List<FeedbackDetailsDto> feedbacks = attendeeWorkshopRegistrationRepo.findFeedbacksByWorkshopId(workshopId)
            .stream()
            .map(reg -> new FeedbackDetailsDto(
                reg.getAttendee().getAttendeeName(),
                reg.getRating(),
                reg.getComment()
            ))
            .collect(Collectors.toList());
        
        return new WorkshopFeedbackDto(
            workshopId,
            workshop.getWorkshopTitle(),
            workshop.getStartDate(),
            workshop.getEndDate(),
            avgRating,
            feedbacks.size(),
            feedbacks
        );
    }

    public String signup(AttendeeRegisterDto attendeeRegisterDto) {
        if (attendeeRepo.existsByAttendeeEmail(attendeeRegisterDto.attendeeEmail())) {
            throw new ConflictException("Attendee", "email", attendeeRegisterDto.attendeeEmail());
        }

        if (attendeeRepo.existsByAttendeePhoneNumber(attendeeRegisterDto.attendeePhoneNumber())) {
            throw new ConflictException("Attendee", "phone number", attendeeRegisterDto.attendeePhoneNumber());
        }
        
        try {
            Attendee attendee = AttendeeMapper.INSTANCE.attendeeRegisterDtoToAttendee(attendeeRegisterDto);
            attendee.setAttendeePassword(passwordEncoder.encode(attendeeRegisterDto.attendeePassword()));
            attendeeRepo.save(attendee);
            
            log.info("Attendee registered successfully with email: {}", attendeeRegisterDto.attendeeEmail());
            return "Attendee registered successfully";
        } catch (Exception e) {
            log.error("Error registering attendee: {}", e.getMessage());
            throw new BadRequestException("Failed to register attendee: " + e.getMessage());
        }
    }

}
