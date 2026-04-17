package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;

public record RecommendedProductVO(
    Long productId,
    String title,
    BigDecimal price,
    Long salesCount,
    Long viewCount,
    String reason
) {}
