package com.digitalbyte.employeeTaskManagement.service;

import com.digitalbyte.employeeTaskManagement.dto.EmployeeRequest;
import com.digitalbyte.employeeTaskManagement.dto.EmployeeResponse;
import com.digitalbyte.employeeTaskManagement.entity.Employee;
import com.digitalbyte.employeeTaskManagement.exception.DuplicateEmailException;
import com.digitalbyte.employeeTaskManagement.exception.EmployeeNotFoundException;
import com.digitalbyte.employeeTaskManagement.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        String email = normalizeEmail(request.email());
        if (employeeRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException(email);
        }
        Employee employee = new Employee(request.name().trim(), email, request.department().trim(), request.jobTitle().trim());
        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = findEmployee(id);
        String email = normalizeEmail(request.email());
        employeeRepository.findByEmailIgnoreCase(email)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new DuplicateEmailException(email); });

        employee.setName(request.name().trim());
        employee.setEmail(email);
        employee.setDepartment(request.department().trim());
        employee.setJobTitle(request.jobTitle().trim());
        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = findEmployee(id);
        employeeRepository.delete(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        return toResponse(findEmployee(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> searchEmployees(String name, String department) {
        boolean hasName = name != null && !name.isBlank();
        boolean hasDepartment = department != null && !department.isBlank();
        List<Employee> employees;
        if (hasName && hasDepartment) {
            employees = employeeRepository.searchByNameAndDepartment(name.trim(), department.trim());
        } else if (hasName) {
            employees = employeeRepository.findByNameContainingIgnoreCase(name.trim());
        } else if (hasDepartment) {
            employees = employeeRepository.findByDepartmentContainingIgnoreCase(department.trim());
        } else {
            employees = employeeRepository.findAll();
        }
        return employees.stream().map(this::toResponse).toList();
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id).orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(employee.getId(), employee.getName(), employee.getEmail(),
                employee.getDepartment(), employee.getJobTitle());
    }
}
