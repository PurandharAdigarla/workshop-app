package com.aptr.workshop_backend.mapper;

import com.aptr.workshop_backend.dto.WorkshopDto;
import com.aptr.workshop_backend.entity.Workshop;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface WorkshopMapper {

    WorkshopMapper INSTANCE = Mappers.getMapper(WorkshopMapper.class);

    WorkshopDto workshopToWorkshopDto(Workshop workshop);

    //This is for patching
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateWorkshopFromDto(WorkshopDto dto, @MappingTarget Workshop workshop);
}
