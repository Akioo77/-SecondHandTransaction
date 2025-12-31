package org.zyq.transaction.transaction.dto;

public final class CategoryControllerDto {

    private CategoryControllerDto() {
    }

    public record CreateRequest(String name) {
    }

    public record UpdateRequest(String name) {
    }
}
