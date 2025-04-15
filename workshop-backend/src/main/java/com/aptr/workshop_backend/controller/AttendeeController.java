package com.aptr.workshop_backend.controller;

import com.aptr.workshop_backend.config.jwt.JwtUtil;
import com.aptr.workshop_backend.dto.*;
import com.aptr.workshop_backend.service.AttendeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@EnableMethodSecurity
@RestController
@RequestMapping("/attendees")
@RequiredArgsConstructor
public class AttendeeController {

    private final AttendeeService attendeeService;
    private final JwtUtil jwtUtil;


    @PostMapping("/signup")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> signup(@RequestBody AttendeeRegisterDto dto) {
        try {
            String result = attendeeService.signup(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AttendeeLoginDto dto) {
        try {
            AttendeeAccessTokenDto token = attendeeService.loginAttendee(dto);
            if (token != null) {
                return ResponseEntity.ok(token);
            } else {
                return ResponseEntity.status(401).body("Invalid credentials");
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendeeDto>> getAllAttendees() {
        return ResponseEntity.ok(attendeeService.allAttendees());
    }
}
