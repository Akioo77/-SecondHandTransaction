package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;

public record SalesSummaryVO(
        Long sellerId,
        Integer totalQuantity,
        BigDecimal totalAmount
) {
}
