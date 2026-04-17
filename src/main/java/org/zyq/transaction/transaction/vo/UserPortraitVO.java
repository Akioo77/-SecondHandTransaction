package org.zyq.transaction.transaction.vo;

import java.util.Map;

public record UserPortraitVO(
    long totalUsers,
    long activeUsers,
    Map<String, Long> regionDistribution,       // 地域分布
    Map<String, Long> purchasePowerDistribution, // 购买力分段
    Map<String, Long> categoryPreference         // 品类偏好
) {}
