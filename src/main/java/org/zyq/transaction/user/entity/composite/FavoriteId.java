package org.zyq.transaction.user.entity.composite;

import jakarta.persistence.Embeddable;

@Embeddable
public class FavoriteId {
    private Long userId;
    private Long productId;
    public FavoriteId() {
    }
    public FavoriteId(Long userId, Long productId) {
        this.userId = userId;
        this.productId = productId;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public Long getProductId() {
        return productId;
    }
    public void setProductId(Long productId) {
        this.productId = productId;
    }
}
