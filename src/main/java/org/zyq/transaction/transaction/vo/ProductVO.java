package org.zyq.transaction.transaction.vo;

import org.zyq.transaction.transaction.entity.Product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductVO(
        Long id,
        Long sellerId,
        Long categoryId,
        String title,
        BigDecimal price,
        Integer quantity,
        String images,
        Integer isDeleted,
        LocalDateTime createdAt
) {
    public static ProductVO from(Product product) {
        return new ProductVO(
                product.getId(),
                product.getSellerId(),
                product.getCategoryId(),
                product.getTitle(),
                product.getPrice(),
                product.getQuantity(),
                product.getImages(),
                product.getIsDeleted(),
                product.getCreatedAt()
        );
    }
}
