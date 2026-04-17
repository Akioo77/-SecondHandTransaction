package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;

public record DailyTrendVO(
    String date,
    Long orderCount,
    Long soldQuantity,
    BigDecimal salesAmount,
    Long viewCount
) {}
