package com.digitalbyte.employeeTaskManagement.service;

import com.digitalbyte.employeeTaskManagement.dto.EmployeeRequest;
import com.digitalbyte.employeeTaskManagement.dto.EmployeeResponse;
import com.digitalbyte.employeeTaskManagement.entity.Employee;
import com.digitalbyte.employeeTaskManagement.exception.DuplicateEmailException;
import com.digitalbyte.employeeTaskManagement.exception.EmployeeNotFoundException;
import com.digitalbyte.employeeTaskManagement.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    private EmployeeServiceImpl employeeService;

    @BeforeEach
    void setUp() {
        employeeService = new EmployeeServiceImpl(employeeRepository);
    }

    @Test
    void createEmployeeSuccessfully() {
        EmployeeRequest request = new EmployeeRequest("Rahul Sharma", "RAHUL@example.com", "Engineering", "Java Developer");
        Employee saved = employee("Rahul Sharma", "rahul@example.com", "Engineering", "Java Developer");
        saved.setId(1L);
        when(employeeRepository.existsByEmailIgnoreCase("rahul@example.com")).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenReturn(saved);

        EmployeeResponse response = employeeService.createEmployee(request);

        assertEquals(1L, response.id());
        assertEquals("rahul@example.com", response.email());
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void createEmployeeRejectsDuplicateEmail() {
        when(employeeRepository.existsByEmailIgnoreCase("rahul@example.com")).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> employeeService.createEmployee(
                new EmployeeRequest("Rahul", "rahul@example.com", "Engineering", "Developer")));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void getEmployeeByIdReturnsEmployee() {
        Employee employee = employee("Rahul", "rahul@example.com", "Engineering", "Developer");
        employee.setId(1L);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        assertEquals("Rahul", employeeService.getEmployeeById(1L).name());
    }

    @Test
    void getEmployeeByIdThrowsWhenMissing() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(EmployeeNotFoundException.class, () -> employeeService.getEmployeeById(99L));
    }

    @Test
    void updateEmployeeChangesFields() {
        Employee employee = employee("Rahul", "rahul@example.com", "Engineering", "Developer");
        employee.setId(1L);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.findByEmailIgnoreCase("rahul@example.com")).thenReturn(Optional.of(employee));
        when(employeeRepository.save(employee)).thenReturn(employee);

        EmployeeResponse response = employeeService.updateEmployee(1L,
                new EmployeeRequest("Rahul Sharma", "rahul@example.com", "Engineering", "Senior Developer"));

        assertEquals("Senior Developer", response.jobTitle());
        verify(employeeRepository).save(employee);
    }

    @Test
    void deleteEmployeeDeletesExistingEmployee() {
        Employee employee = employee("Rahul", "rahul@example.com", "Engineering", "Developer");
        employee.setId(1L);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        employeeService.deleteEmployee(1L);

        verify(employeeRepository).delete(employee);
    }

    @Test
    void getAllEmployeesReturnsMappedResponses() {
        Employee first = employee("Rahul", "rahul@example.com", "Engineering", "Developer");
        first.setId(1L);
        Employee second = employee("Priya", "priya@example.com", "HR", "Manager");
        second.setId(2L);
        when(employeeRepository.findAll()).thenReturn(List.of(first, second));

        assertEquals(2, employeeService.getAllEmployees().size());
    }

    @Test
    void searchEmployeesUsesCombinedSearchWhenBothFiltersProvided() {
        Employee employee = employee("Rahul", "rahul@example.com", "Engineering", "Developer");
        employee.setId(1L);
        when(employeeRepository.searchByNameAndDepartment("Rahul", "Engineering")).thenReturn(List.of(employee));

        assertEquals(1, employeeService.searchEmployees("Rahul", "Engineering").size());
        verify(employeeRepository).searchByNameAndDepartment("Rahul", "Engineering");
    }

    private Employee employee(String name, String email, String department, String jobTitle) {
        return new Employee(name, email, department, jobTitle);
    }
}
