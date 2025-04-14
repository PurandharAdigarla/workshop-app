package com.aptr.workshop_backend.service;

import com.aptr.workshop_backend.config.jwt.JwtUtil;
import com.aptr.workshop_backend.dto.*;
import com.aptr.workshop_backend.entity.Attendee;
import com.aptr.workshop_backend.mapper.AttendeeMapper;
import com.aptr.workshop_backend.repository.AttendeeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendeeService {
    private final AttendeeRepo attendeeRepo;
    private final AttendeeMapper attendeeMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String signup(AttendeeRegisterDto attendeeRegisterDto) {
        if (attendeeRepo.existsByAttendeeEmail(attendeeRegisterDto.attendeeEmail())) {
            return "Email already in use";
        }

        if (attendeeRepo.existsByAttendeePhoneNumber(attendeeRegisterDto.attendeePhoneNumber())) {
            return "Phone number already in use";
        }
        Attendee attendee = AttendeeMapper.INSTANCE.attendeeRegisterDtoToAttendee(attendeeRegisterDto);
        attendee.setAttendeePassword(passwordEncoder.encode(attendeeRegisterDto.attendeePassword()));
        attendeeRepo.save(attendee);
        return "Attendee registered successfully";
    }

    public AttendeeAccessTokenDto loginAttendee(AttendeeLoginDto attendeeLoginDto) {
        Optional<Attendee> optionalAttendee = attendeeRepo.findByAttendeeEmail(attendeeLoginDto.attendeeEmail());
        if (optionalAttendee.isPresent()) {
            Attendee attendee = optionalAttendee.get();
            if (passwordEncoder.matches(attendeeLoginDto.attendeePassword(), attendee.getAttendeePassword())) {
                String accessToken = jwtUtil.generateAccessToken(attendee.getAttendeeEmail(), attendee.getRole());
                return new AttendeeAccessTokenDto(accessToken, attendee.getAttendeeId());
            }
        }
        return null;
    }

    public List<AttendeeDto> allAttendees() {
        List<Attendee> attendees = attendeeRepo.findAll();
        return attendees.stream()
                .map(attendeeMapper::attendeeToAttendeesDto)
                .collect(Collectors.toList());
    }
}
