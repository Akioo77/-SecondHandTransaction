package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;

public record RankingItemVO(
    Long productId,
    String productTitle,
    Long categoryId,
    String categoryName,
    BigDecimal price,
    Long salesCount,
    BigDecimal salesAmount,
    Long viewCount,
    Long favoriteCount
) {}
