package com.digitalbyte.employeeTaskManagement.service;

import com.digitalbyte.employeeTaskManagement.dto.TaskRequest;
import com.digitalbyte.employeeTaskManagement.dto.TaskResponse;
import com.digitalbyte.employeeTaskManagement.dto.TaskStatusRequest;
import com.digitalbyte.employeeTaskManagement.entity.Employee;
import com.digitalbyte.employeeTaskManagement.entity.Task;
import com.digitalbyte.employeeTaskManagement.entity.TaskPriority;
import com.digitalbyte.employeeTaskManagement.entity.TaskStatus;
import com.digitalbyte.employeeTaskManagement.exception.EmployeeNotFoundException;
import com.digitalbyte.employeeTaskManagement.exception.TaskNotFoundException;
import com.digitalbyte.employeeTaskManagement.repository.EmployeeRepository;
import com.digitalbyte.employeeTaskManagement.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    private TaskServiceImpl taskService;

    @BeforeEach
    void setUp() {
        taskService = new TaskServiceImpl(taskRepository, employeeRepository);
    }

    @Test
    void createTaskSuccessfullyDefaultsToTodo() {
        Employee employee = employee();
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(10L);
            return task;
        });

        TaskResponse response = taskService.createTask(request(null));

        assertEquals(10L, response.id());
        assertEquals(TaskStatus.TODO, response.status());
        assertEquals(1L, response.employeeId());
    }

    @Test
    void createTaskThrowsWhenEmployeeDoesNotExist() {
        when(employeeRepository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(EmployeeNotFoundException.class, () -> taskService.createTask(requestForEmployee(404L)));
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void getTaskReturnsMappedResponse() {
        Task task = task();
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        assertEquals("Complete training", taskService.getTaskById(10L).title());
    }

    @Test
    void getTaskThrowsWhenMissing() {
        when(taskRepository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(TaskNotFoundException.class, () -> taskService.getTaskById(404L));
    }

    @Test
    void updateTaskChangesTaskAndEmployee() {
        Task task = task();
        Employee employee = employee();
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(taskRepository.save(task)).thenReturn(task);

        TaskResponse response = taskService.updateTask(10L,
                new TaskRequest("Updated title", "Updated description", TaskStatus.IN_PROGRESS,
                        TaskPriority.HIGH, LocalDate.of(2026, 8, 30), 1L));

        assertEquals("Updated title", response.title());
        assertEquals(TaskStatus.IN_PROGRESS, response.status());
        verify(taskRepository).save(task);
    }

    @Test
    void updateTaskStatusChangesStatus() {
        Task task = task();
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);

        assertEquals(TaskStatus.COMPLETED,
                taskService.updateTaskStatus(10L, new TaskStatusRequest(TaskStatus.COMPLETED)).status());
    }

    @Test
    void deleteTaskDeletesExistingTask() {
        Task task = task();
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        taskService.deleteTask(10L);
        verify(taskRepository).delete(task);
    }

    @Test
    void getTasksByEmployeeVerifiesEmployeeAndReturnsTasks() {
        Employee employee = employee();
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(taskRepository.findByEmployeeId(1L)).thenReturn(List.of(task()));

        assertEquals(1, taskService.getTasksByEmployee(1L).size());
        verify(taskRepository).findByEmployeeId(1L);
    }

    private TaskRequest request(TaskStatus status) {
        return new TaskRequest("Complete training", "Complete Spring Boot training", status,
                TaskPriority.HIGH, LocalDate.of(2026, 8, 30), 1L);
    }

    private TaskRequest requestForEmployee(Long employeeId) {
        return new TaskRequest("Complete training", "Complete Spring Boot training", null,
                TaskPriority.HIGH, LocalDate.of(2026, 8, 30), employeeId);
    }

    private Employee employee() {
        Employee employee = new Employee("Rahul", "rahul@example.com", "Engineering", "Developer");
        employee.setId(1L);
        return employee;
    }

    private Task task() {
        Task task = new Task();
        task.setId(10L);
        task.setTitle("Complete training");
        task.setDescription("Complete Spring Boot training");
        task.setStatus(TaskStatus.TODO);
        task.setPriority(TaskPriority.HIGH);
        task.setDueDate(LocalDate.of(2026, 8, 30));
        task.setEmployee(employee());
        return task;
    }
}
