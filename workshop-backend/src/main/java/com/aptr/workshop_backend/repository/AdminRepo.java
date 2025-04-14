package com.aptr.workshop_backend.repository;

import com.aptr.workshop_backend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface AdminRepo extends JpaRepository<Admin, String> {
    Optional<Admin> findByAdminUserId(String adminUserId);
}


