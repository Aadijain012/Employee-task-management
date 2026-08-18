package com.digitalbyte.employeeTaskManagement.repository;

import com.digitalbyte.employeeTaskManagement.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<Employee> findByNameContainingIgnoreCase(String name);

    List<Employee> findByDepartmentContainingIgnoreCase(String department);

    @Query("select e from Employee e where lower(e.name) like lower(concat('%', :name, '%')) "
            + "and lower(e.department) like lower(concat('%', :department, '%'))")
    List<Employee> searchByNameAndDepartment(@Param("name") String name, @Param("department") String department);
}
