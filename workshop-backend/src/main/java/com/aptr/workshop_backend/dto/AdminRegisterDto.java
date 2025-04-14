package com.aptr.workshop_backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegisterDto {
    private String adminName;
    private String adminUserId;
    private String adminPassword;
}
