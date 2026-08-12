package com.fxec.digitallostfound.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle RuntimeException
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException exception) {

        Map<String, Object> response = new HashMap<>();

        response.put("message", exception.getMessage());
        response.put("status", HttpStatus.BAD_REQUEST.value());

        return new ResponseEntity<>(
                response,
                HttpStatus.BAD_REQUEST
        );
    }
}