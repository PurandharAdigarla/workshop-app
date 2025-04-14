package com.aptr.workshop_backend.controller;

import com.aptr.workshop_backend.dto.*;
import com.aptr.workshop_backend.entity.Admin;
import com.aptr.workshop_backend.entity.Attendee;
import com.aptr.workshop_backend.entity.AttendeeWorkshopRegistration;
import com.aptr.workshop_backend.service.AdminService;
import com.aptr.workshop_backend.service.WorkshopStateUpdater;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final WorkshopStateUpdater workshopStateUpdater;

    @PostMapping("/register")
    public ResponseEntity<String> addNewAdmin(@RequestBody AdminRegisterDto adminRegisterDto) {
        return ResponseEntity.ok(adminService.addNewAdmin(adminRegisterDto));
    }

    @PostMapping("/login")
    public ResponseEntity<AccessTokenDto> adminLogin(@RequestBody AdminLoginDto adminLoginDto) {
        AccessTokenDto accessTokenDto = adminService.adminLogin(adminLoginDto);
        if (accessTokenDto == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        return ResponseEntity.ok(accessTokenDto);
    }

    @GetMapping()
    public ResponseEntity<List<AdminsDto>> allAdmins() {
        return new ResponseEntity<>(adminService.allAdmins(), HttpStatus.OK);
    }

    @PostMapping("/update-workshop-states")
    public ResponseEntity<Map<String, Integer>> manualUpdateWorkshopStates() {
        Map<String, Integer> result = workshopStateUpdater.manualUpdate();
        return ResponseEntity.ok(result);
    }
}
