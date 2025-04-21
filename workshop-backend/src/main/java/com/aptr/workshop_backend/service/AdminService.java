package com.aptr.workshop_backend.service;

import com.aptr.workshop_backend.config.jwt.JwtUtil;
import com.aptr.workshop_backend.dto.*;
import com.aptr.workshop_backend.entity.Admin;
import com.aptr.workshop_backend.mapper.AdminMapper;
import com.aptr.workshop_backend.repository.AdminRepo;
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
public class AdminService {
    private final AdminRepo adminRepo;
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String addNewAdmin(AdminRegisterDto adminRegisterDto) {
        Admin admin=AdminMapper.INSTANCE.adminRegisterDtoToAdmin(adminRegisterDto);
        admin.setAdminPassword(passwordEncoder.encode(adminRegisterDto.getAdminPassword()));
        //admin.setAdminPassword(passwordEncoder.encode(admin.getAdminPassword()));
        adminRepo.save(admin);
        return "New Admin added successfully";
    }

    public AccessTokenDto adminLogin(AdminLoginDto adminLoginDto) {
        log.info("Admin login attempt for user: {}", adminLoginDto.adminUserId());
        
        Optional<Admin> optionalAdmin = adminRepo.findByAdminUserId(adminLoginDto.adminUserId());
        if (optionalAdmin.isEmpty()) {
            log.warn("Login failed: Admin user ID not found: {}", adminLoginDto.adminUserId());
            return null;
        }
        
        Admin admin = optionalAdmin.get();
        if (!passwordEncoder.matches(adminLoginDto.adminPassword(), admin.getAdminPassword())) {
            log.warn("Login failed: Invalid password for admin user: {}", adminLoginDto.adminUserId());
            return null;
        }
        
        String accessToken = jwtUtil.generateAccessToken(admin.getAdminUserId(), admin.getRole());
        log.info("Admin login successful for user: {}", adminLoginDto.adminUserId());
        
        return new AccessTokenDto(accessToken, admin.getAdminId());
    }

    public List<AdminsDto> allAdmins() {
        List<Admin> admins = adminRepo.findAll();
        return admins.stream()
                .map(adminMapper::adminToAdminsDto)
                .collect(Collectors.toList());
    }

}
