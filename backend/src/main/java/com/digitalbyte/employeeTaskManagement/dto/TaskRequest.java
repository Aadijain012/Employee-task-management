package com.digitalbyte.employeeTaskManagement.dto;

import com.digitalbyte.employeeTaskManagement.entity.TaskPriority;
import com.digitalbyte.employeeTaskManagement.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record TaskRequest(
        @NotBlank(message = "Title is required") String title,
        @NotBlank(message = "Description is required") String description,
        TaskStatus status,
        @NotNull(message = "Priority is required") TaskPriority priority,
        @NotNull(message = "Due date is required") LocalDate dueDate,
        @NotNull(message = "Employee ID is required") Long employeeId
) {
}
