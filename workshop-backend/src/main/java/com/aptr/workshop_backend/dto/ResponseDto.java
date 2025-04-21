package com.aptr.workshop_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseDto<T>
{
    int recordCount;
    T attendees;
}
