package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;

public record MonthlyTrendVO(
    String month,
    Long orderCount,
    Long soldQuantity,
    BigDecimal salesAmount
) {}
