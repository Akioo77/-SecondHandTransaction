package org.zyq.transaction.common.exception;

public class ApiException extends RuntimeException {
    private final int code;
    private final String message;
    private final String reason;
    public ApiException(int code, String message, String reason) {
        this.code = code;
        this.message = message;
        this.reason = reason;
    }
    public int getCode() {
        return code;
    }
    public String getMessage() {
        return message;
    }
    public String getReason() {
        return reason;
    }
}
