package com.aptr.workshop_backend.service;

import com.aptr.workshop_backend.config.jwt.JwtUtil;
import com.aptr.workshop_backend.dto.*;
import com.aptr.workshop_backend.entity.Admin;
import com.aptr.workshop_backend.mapper.AdminMapper;
import com.aptr.workshop_backend.repository.AdminRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
        Optional<Admin> optionalAdmin = adminRepo.findByAdminUserId(adminLoginDto.adminUserId());
        if (optionalAdmin.isPresent()) {
            Admin admin = optionalAdmin.get();
            if (passwordEncoder.matches(adminLoginDto.adminPassword(), admin.getAdminPassword())) {
                String accessToken = jwtUtil.generateAccessToken(admin.getAdminUserId(), admin.getRole());
                return new AccessTokenDto(accessToken);
            }
        }
        return null;
    }

    public List<AdminsDto> allAdmins() {
        List<Admin> admins = adminRepo.findAll();
        return admins.stream()
                .map(adminMapper::adminToAdminsDto)
                .collect(Collectors.toList());
    }

}
