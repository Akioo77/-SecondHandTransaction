package org.zyq.transaction.common.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorRepsponse> handleApiException(ApiException e) {
        e.printStackTrace();
        ErrorRepsponse errorResponse = new ErrorRepsponse(e.getMessage(), e.getReason());
        return ResponseEntity.status(e.getCode()).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRepsponse> handleException(Exception e) {
        ErrorRepsponse errorResponse = new ErrorRepsponse("Internal Server Error: " + e.getMessage(), null);
        e.printStackTrace();
        return ResponseEntity.status(500).body(errorResponse);
    }
}
