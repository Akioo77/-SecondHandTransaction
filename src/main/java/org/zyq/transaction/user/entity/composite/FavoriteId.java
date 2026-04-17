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
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FavoriteId that = (FavoriteId) o;
        return userId != null ? userId.equals(that.userId) : that.userId == null
            && productId != null ? productId.equals(that.productId) : that.productId == null;
    }
    @Override
    public int hashCode() {
        return userId != null ? userId.hashCode() : 0;
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
