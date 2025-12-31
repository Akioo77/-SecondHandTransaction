package org.zyq.transaction.transaction.dto;

import java.math.BigDecimal;

public final class ProductControllerDto {

    private ProductControllerDto() {
    }

    public record CreateRequest(
            Long sellerId,
            Long categoryId,
            String title,
            BigDecimal price,
            Integer quantity,
            String images
    ) {
    }

    public record UpdateRequest(
            Long categoryId,
            String title,
            BigDecimal price,
            Integer quantity,
            String images,
            Integer isDeleted
    ) {
    }
}
