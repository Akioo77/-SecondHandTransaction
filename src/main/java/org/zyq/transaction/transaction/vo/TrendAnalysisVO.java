package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;

public record TrendAnalysisVO(
    BigDecimal currentSales,
    BigDecimal previousSales,
    BigDecimal salesChangePct,   // 销售额环比变化%
    long currentSoldQty,
    long previousSoldQty,
    BigDecimal qtyChangePct,      // 销量环比变化%
    String trend,                 // 上涨/下跌/持平
    String advice                 // 运营建议
) {}
