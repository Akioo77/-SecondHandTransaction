package org.zyq.transaction.transaction.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_stats")
public class ProductStats {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @Column(name = "order_count", nullable = false)
    private Long orderCount = 0L;

    @Column(name = "order_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal orderAmount = BigDecimal.ZERO;

    @Column(name = "favorite_count", nullable = false)
    private Long favoriteCount = 0L;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 平均停留时长（秒），由 product_views 聚合计算
    @Column(name = "avg_view_duration")
    private Double avgViewDuration = 0.0;

    // getter / setter
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }

    public Long getOrderCount() { return orderCount; }
    public void setOrderCount(Long orderCount) { this.orderCount = orderCount; }

    public BigDecimal getOrderAmount() { return orderAmount; }
    public void setOrderAmount(BigDecimal orderAmount) { this.orderAmount = orderAmount; }

    public Long getFavoriteCount() { return favoriteCount; }
    public void setFavoriteCount(Long favoriteCount) { this.favoriteCount = favoriteCount; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Double getAvgViewDuration() { return avgViewDuration; }
    public void setAvgViewDuration(Double avgViewDuration) { this.avgViewDuration = avgViewDuration; }
}
