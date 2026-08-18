package com.digitalbyte.employeeTaskManagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmployeeRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email,
        @NotBlank(message = "Department is required") String department,
        @NotBlank(message = "Job title is required") String jobTitle
) {
}
