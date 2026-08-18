package com.digitalbyte.employeeTaskManagement.controller;

import com.digitalbyte.employeeTaskManagement.dto.EmployeeRequest;
import com.digitalbyte.employeeTaskManagement.dto.EmployeeResponse;
import com.digitalbyte.employeeTaskManagement.dto.TaskResponse;
import com.digitalbyte.employeeTaskManagement.service.EmployeeService;
import com.digitalbyte.employeeTaskManagement.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final TaskService taskService;

    public EmployeeController(EmployeeService employeeService, TaskService taskService) {
        this.employeeService = employeeService;
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(CREATED)
    public EmployeeResponse createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.updateEmployee(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public EmployeeResponse getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    @GetMapping
    public List<EmployeeResponse> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/search")
    public List<EmployeeResponse> searchEmployees(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String department) {
        return employeeService.searchEmployees(name, department);
    }

    @GetMapping("/{employeeId}/tasks")
    public List<TaskResponse> getEmployeeTasks(@PathVariable Long employeeId) {
        return taskService.getTasksByEmployee(employeeId);
    }
}
