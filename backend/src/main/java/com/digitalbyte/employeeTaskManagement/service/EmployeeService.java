package com.digitalbyte.employeeTaskManagement.service;

import com.digitalbyte.employeeTaskManagement.dto.EmployeeRequest;
import com.digitalbyte.employeeTaskManagement.dto.EmployeeResponse;

import java.util.List;

public interface EmployeeService {
    EmployeeResponse createEmployee(EmployeeRequest request);
    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);
    void deleteEmployee(Long id);
    EmployeeResponse getEmployeeById(Long id);
    List<EmployeeResponse> getAllEmployees();
    List<EmployeeResponse> searchEmployees(String name, String department);
}
