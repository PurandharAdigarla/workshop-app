package com.aptr.workshop_backend.service;

import com.aptr.workshop_backend.entity.Admin;
import com.aptr.workshop_backend.entity.Attendee;
import com.aptr.workshop_backend.repository.AdminRepo;
import com.aptr.workshop_backend.repository.AttendeeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UnifiedUserDetailsService implements UserDetailsService {

    private final AdminRepo adminRepo;
    private final AttendeeRepo attendeeRepo;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {

        Optional<Admin> adminOpt = adminRepo.findByAdminUserId(identifier);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return User.builder()
                    .username(admin.getAdminUserId())
                    .password(admin.getAdminPassword())
                    .roles(admin.getRole().name()) // Assuming you store role as enum
                    .build();
        }

        Optional<Attendee> attendeeOpt = attendeeRepo.findByAttendeeEmail(identifier);
        if (attendeeOpt.isPresent()) {
            Attendee attendee = attendeeOpt.get();
            return User.builder()
                    .username(attendee.getAttendeeEmail())
                    .password("") // OTP login, so no password stored
                    .roles(attendee.getRole().name())
                    .build();
        }

        throw new UsernameNotFoundException("User not found: " + identifier);
    }
}
