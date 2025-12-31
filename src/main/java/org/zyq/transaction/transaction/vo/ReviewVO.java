package org.zyq.transaction.transaction.vo;

import org.zyq.transaction.transaction.entity.Review;

import java.time.LocalDateTime;

public record ReviewVO(
        Long id,
        Long orderId,
        Integer rating,
        String content,
        LocalDateTime createdAt
) {
    public static ReviewVO from(Review review) {
        return new ReviewVO(
                review.getId(),
                review.getOrderId(),
                review.getRating(),
                review.getContent(),
                review.getCreatedAt()
        );
    }
}
