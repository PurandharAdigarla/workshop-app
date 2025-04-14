package com.aptr.workshop_backend.exception;

import org.springframework.core.convert.ConversionFailedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.DateTimeException;
import java.time.format.DateTimeParseException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String errorMessage = "Invalid request format";
        
        // Check if it's a date format issue
        if (ex.getCause() != null) {
            Throwable rootCause = getRootCause(ex);
            if (rootCause instanceof DateTimeParseException || rootCause instanceof DateTimeException) {
                errorMessage = "Invalid date format. Please use YYYY-MM-DD format";
            }
        }
        
        System.err.println("Request parsing error: " + ex.getMessage());
        return new ResponseEntity<>(errorMessage, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler({DateTimeParseException.class, DateTimeException.class})
    public ResponseEntity<String> handleDateTimeParseException(Exception ex) {
        System.err.println("Date parsing error: " + ex.getMessage());
        return new ResponseEntity<>("Invalid date format. Please use YYYY-MM-DD format", HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<String> handleAccessDeniedException(Exception ex) {
        System.err.println("Access denied: " + ex.getMessage());
        return new ResponseEntity<>("You do not have permission to perform this action. Please ensure you are logged in with the correct account.", 
                HttpStatus.FORBIDDEN);
    }
    
    @ExceptionHandler({MethodArgumentTypeMismatchException.class, ConversionFailedException.class})
    public ResponseEntity<String> handleTypeMismatch(Exception ex) {
        System.err.println("Type conversion error: " + ex.getMessage());
        
        String errorMessage = "Invalid parameter type";
        if (ex.getMessage().contains("LocalDate")) {
            errorMessage = "Invalid date format. Please use YYYY-MM-DD format";
        }
        
        return new ResponseEntity<>(errorMessage, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        System.err.println("Unhandled exception: " + ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // Helper method to get the root cause of an exception
    private Throwable getRootCause(Throwable throwable) {
        Throwable cause = throwable.getCause();
        if (cause == null) {
            return throwable;
        }
        return getRootCause(cause);
    }
} 