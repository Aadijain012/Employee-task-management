package com.digitalbyte.employeeTaskManagement.exception;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("An employee already exists with email: " + email);
    }
}
