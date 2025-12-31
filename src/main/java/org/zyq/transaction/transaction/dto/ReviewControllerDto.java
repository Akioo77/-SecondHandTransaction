package org.zyq.transaction.transaction.dto;

public final class ReviewControllerDto {

    private ReviewControllerDto() {
    }

    public record CreateRequest(Long orderId, Integer rating, String content) {
    }
}
