package com.digitalbyte.employeeTaskManagement.service;

import com.digitalbyte.employeeTaskManagement.dto.TaskRequest;
import com.digitalbyte.employeeTaskManagement.dto.TaskResponse;
import com.digitalbyte.employeeTaskManagement.dto.TaskStatusRequest;
import com.digitalbyte.employeeTaskManagement.entity.Employee;
import com.digitalbyte.employeeTaskManagement.entity.Task;
import com.digitalbyte.employeeTaskManagement.entity.TaskStatus;
import com.digitalbyte.employeeTaskManagement.exception.EmployeeNotFoundException;
import com.digitalbyte.employeeTaskManagement.exception.TaskNotFoundException;
import com.digitalbyte.employeeTaskManagement.repository.EmployeeRepository;
import com.digitalbyte.employeeTaskManagement.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;

    public TaskServiceImpl(TaskRepository taskRepository, EmployeeRepository employeeRepository) {
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public TaskResponse createTask(TaskRequest request) {
        Employee employee = findEmployee(request.employeeId());
        Task task = new Task();
        applyRequest(task, request, employee);
        if (request.status() == null) {
            task.setStatus(TaskStatus.TODO);
        }
        return toResponse(taskRepository.save(task));
    }

    @Override
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findTask(id);
        Employee employee = findEmployee(request.employeeId());
        applyRequest(task, request, employee);
        if (request.status() == null) {
            task.setStatus(TaskStatus.TODO);
        }
        return toResponse(taskRepository.save(task));
    }

    @Override
    public TaskResponse updateTaskStatus(Long id, TaskStatusRequest request) {
        Task task = findTask(id);
        task.setStatus(request.status());
        return toResponse(taskRepository.save(task));
    }

    @Override
    public void deleteTask(Long id) {
        taskRepository.delete(findTask(id));
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        return toResponse(findTask(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByEmployee(Long employeeId) {
        findEmployee(employeeId);
        return taskRepository.findByEmployeeId(employeeId).stream().map(this::toResponse).toList();
    }

    private void applyRequest(Task task, TaskRequest request, Employee employee) {
        task.setTitle(request.title().trim());
        task.setDescription(request.description().trim());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setEmployee(employee);
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id).orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    private Task findTask(Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(), task.getStatus(),
                task.getPriority(), task.getDueDate(), task.getEmployee().getId());
    }
}
