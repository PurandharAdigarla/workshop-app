package com.aptr.workshop_backend.service;

import com.aptr.workshop_backend.config.jwt.JwtUtil;
import com.aptr.workshop_backend.dto.AttendeeAccessTokenDto;
import com.aptr.workshop_backend.dto.AttendeeDto;
import com.aptr.workshop_backend.dto.AttendeeLoginDto;
import com.aptr.workshop_backend.dto.AttendeeRegisterDto;
import com.aptr.workshop_backend.entity.Attendee;
import com.aptr.workshop_backend.exception.ConflictException;
import com.aptr.workshop_backend.exception.UnauthorizedException;
import com.aptr.workshop_backend.exception.ResourceNotFoundException;
import com.aptr.workshop_backend.mapper.AttendeeMapper;
import com.aptr.workshop_backend.repository.AttendeeRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendeeService {
    private final AttendeeRepo attendeeRepo;
    private final AttendeeMapper attendeeMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

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
            throw e;
        }
    }

    public AttendeeAccessTokenDto loginAttendee(AttendeeLoginDto attendeeLoginDto) {
        Optional<Attendee> attendeeOptional = attendeeRepo.findByAttendeeEmail(attendeeLoginDto.attendeeEmail());
        
        if (attendeeOptional.isEmpty()) {
            throw new ResourceNotFoundException("Attendee", "email", attendeeLoginDto.attendeeEmail());
        }
        
        Attendee attendee = attendeeOptional.get();
        
        if (!passwordEncoder.matches(attendeeLoginDto.attendeePassword(), attendee.getAttendeePassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        
        String accessToken = jwtUtil.generateAccessToken(attendee.getAttendeeEmail(), attendee.getRole());
        
        return new AttendeeAccessTokenDto(accessToken, attendee.getAttendeeId());
    }

    public List<AttendeeDto> allAttendees() {
        List<Attendee> attendees = attendeeRepo.findAll();
        return attendees.stream()
                .map(attendeeMapper::attendeeToAttendeesDto)
                .collect(Collectors.toList());
    }
}
