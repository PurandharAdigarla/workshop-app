package com.aptr.workshop_backend.mapper;

import com.aptr.workshop_backend.dto.AdminLoginDto;
import com.aptr.workshop_backend.dto.AdminRegisterDto;
import com.aptr.workshop_backend.dto.AdminsDto;
import com.aptr.workshop_backend.entity.Admin;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AdminMapper
{
    AdminMapper INSTANCE = Mappers.getMapper(AdminMapper.class);

    AdminLoginDto adminToAdminLoginDto(Admin admin);
    AdminsDto adminToAdminsDto(Admin admin);
    AdminRegisterDto adminToAdminRegisterDto(Admin admin);
    Admin adminRegisterDtoToAdmin(AdminRegisterDto dto);
}
