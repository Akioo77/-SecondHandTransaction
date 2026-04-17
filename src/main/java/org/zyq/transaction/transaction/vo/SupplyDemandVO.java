package org.zyq.transaction.transaction.vo;

public record SupplyDemandVO(
    Long categoryId,
    String categoryName,
    long supply,      // 供给量（库存总量）
    long demand,      // 需求量（已售量）
    String status     // 供需状态
) {}
