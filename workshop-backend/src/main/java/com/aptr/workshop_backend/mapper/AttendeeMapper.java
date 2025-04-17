package com.aptr.workshop_backend.mapper;

import com.aptr.workshop_backend.dto.AttendeeDto;
import com.aptr.workshop_backend.dto.AttendeeRegisterDto;
import com.aptr.workshop_backend.entity.Attendee;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AttendeeMapper {
    AttendeeMapper INSTANCE = Mappers.getMapper(AttendeeMapper.class);

    Attendee attendeeRegisterDtoToAttendee(AttendeeRegisterDto dto);
    
    AttendeeDto attendeeToAttendeesDto(Attendee attendee);
    
    AttendeeDto attendeeToAttendeeResponseDto(Attendee attendee);
}
