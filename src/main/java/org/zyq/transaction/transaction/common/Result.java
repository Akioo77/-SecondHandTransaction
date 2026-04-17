package org.zyq.transaction.transaction.common;

public class Result<T> {
    public int code;
    public String message;
    public T data;

    public Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(0, "success", data);
    }

    public static <T> Result<T> error(String message) {
        return new Result<>(1, message, null);
    }
}
