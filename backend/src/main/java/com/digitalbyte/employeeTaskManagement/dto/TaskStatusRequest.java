package com.digitalbyte.employeeTaskManagement.dto;

import com.digitalbyte.employeeTaskManagement.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusRequest(
        @NotNull(message = "Status is required") TaskStatus status
) {
}
