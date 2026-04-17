package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 销售趋势预测结果
 */
public record SalesForecastVO(
    String trend,              // "上涨" / "下跌" / "持平"
    double slope,              // 线性回归斜率（每日增量）
    double rSquared,           // R² 决定系数（0~1，衡量拟合优度）
    String confidence,         // "高" / "中" / "低"
    List<ForecastDayVO> forecast, // 未来7天预测
    Map<String, Object> summary  // 摘要
) {
    public record ForecastDayVO(
        String date,
        double predictedOrders,
        double predictedRevenue,
        double lowerBound,   // 置信下界
        double upperBound    // 置信上界
    ) {}
}
