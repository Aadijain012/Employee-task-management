package com.digitalbyte.employeeTaskManagement.dto;

import com.digitalbyte.employeeTaskManagement.entity.TaskPriority;
import com.digitalbyte.employeeTaskManagement.entity.TaskStatus;

import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        Long employeeId
) {
}
