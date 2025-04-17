package com.aptr.workshop_backend.controller;

import com.aptr.workshop_backend.dto.AttendeeAccessTokenDto;
import com.aptr.workshop_backend.dto.AttendeeDto;
import com.aptr.workshop_backend.dto.AttendeeLoginDto;
import com.aptr.workshop_backend.dto.AttendeeRegisterDto;
import com.aptr.workshop_backend.exception.ConflictException;
import com.aptr.workshop_backend.exception.UnauthorizedException;
import com.aptr.workshop_backend.service.AttendeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@EnableMethodSecurity
@RestController
@RequestMapping("/attendees")
@RequiredArgsConstructor
@Slf4j
public class AttendeeController {
    private final AttendeeService attendeeService;

    @PostMapping("/signup")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> signup(@RequestBody AttendeeRegisterDto dto) {
        String result = attendeeService.signup(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/login")
    @PreAuthorize("permitAll()")
    public ResponseEntity<AttendeeAccessTokenDto> login(@RequestBody AttendeeLoginDto dto) {
        AttendeeAccessTokenDto token = attendeeService.loginAttendee(dto);
        return ResponseEntity.ok(token);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendeeDto>> getAllAttendees() {
        return ResponseEntity.ok(attendeeService.allAttendees());
    }
}
