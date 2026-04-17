package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;

/**
 * 销售异常事件
 */
public record AnomalyDetectionVO(
    String type,          // "ORDER_SPIKE" | "BRUSH_ORDER" | "PRICE_ANOMALY"
    String level,         // "WARNING" | "DANGER"
    String description,   // 描述
    String detail,        // 详细数据
    String detectedAt     // 检测时间
) {}
