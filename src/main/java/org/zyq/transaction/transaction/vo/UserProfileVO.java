package org.zyq.transaction.transaction.vo;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 用户画像详情
 */
public record UserProfileVO(
    Long userId,
    String username,
    String region,               // 登录地区
    String lastLoginIp,
    String createdAt,            // 注册时间
    PurchasePower purchasePower, // 购买力分析
    List<CategoryPreference> categoryPreferences, // 品类偏好
    BehaviorStats behaviorStats  // 行为统计
) {
    public record PurchasePower(
        BigDecimal totalSpend,     // 累计消费
        long orderCount,           // 订单总数
        long completedOrders,       // 已完成订单
        BigDecimal avgOrderAmount,  // 客单价
        String level               // 高/中/低
    ) {}

    public record CategoryPreference(
        String categoryName,
        Long categoryId,
        long viewCount,           // 浏览次数
        long buyCount,            // 购买次数
        BigDecimal spend,         // 该品类消费
        String preferenceLevel    // 高/中/低
    ) {}

    public record BehaviorStats(
        long totalViews,           // 浏览商品数
        long totalFavorites,       // 收藏数
        long publishCount,         // 发布商品数
        long buyCount,             // 购买次数
        long sellCount,            // 卖出次数
        long activeDays            // 活跃天数
    ) {}
}
