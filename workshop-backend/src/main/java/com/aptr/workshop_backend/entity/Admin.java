package com.aptr.workshop_backend.entity;

import com.aptr.workshop_backend.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adminId;
    private String adminName;
    private String adminUserId;
    private String adminPassword;
    @Enumerated(EnumType.STRING)
    private Role role = Role.ADMIN;
}
