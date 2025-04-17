package com.aptr.workshop_backend.entity;

import com.aptr.workshop_backend.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Attendee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendeeId;
    
    @Column(unique = true, nullable = false)
    private String attendeeEmail;
    
    @Column(unique = true, nullable = false)
    private String attendeePhoneNumber;
    
    @Column(nullable = false)
    private String attendeeName;
    
    @Column(nullable = false)
    private String attendeePassword;
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.ATTENDEE;
}
