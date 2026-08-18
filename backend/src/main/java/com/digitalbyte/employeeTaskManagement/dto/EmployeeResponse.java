package com.digitalbyte.employeeTaskManagement.dto;

public record EmployeeResponse(
        Long id,
        String name,
        String email,
        String department,
        String jobTitle
) {
}
