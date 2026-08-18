package com.digitalbyte.employeeTaskManagement.service;

import com.digitalbyte.employeeTaskManagement.dto.TaskRequest;
import com.digitalbyte.employeeTaskManagement.dto.TaskResponse;
import com.digitalbyte.employeeTaskManagement.dto.TaskStatusRequest;

import java.util.List;

public interface TaskService {
    TaskResponse createTask(TaskRequest request);
    TaskResponse updateTask(Long id, TaskRequest request);
    TaskResponse updateTaskStatus(Long id, TaskStatusRequest request);
    void deleteTask(Long id);
    TaskResponse getTaskById(Long id);
    List<TaskResponse> getAllTasks();
    List<TaskResponse> getTasksByEmployee(Long employeeId);
}
