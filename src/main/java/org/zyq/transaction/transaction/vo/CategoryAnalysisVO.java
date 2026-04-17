package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;

public record CategoryAnalysisVO(
    Long categoryId,
    String categoryName,
    Long productCount,
    Long soldQuantity,
    BigDecimal totalSalesAmount,
    BigDecimal avgPrice
) {}
