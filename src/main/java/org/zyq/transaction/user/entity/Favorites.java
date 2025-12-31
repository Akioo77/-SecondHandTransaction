package org.zyq.transaction.user.entity;

import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import org.hibernate.annotations.CreationTimestamp;
import org.zyq.transaction.user.entity.composite.FavoriteId;

import java.time.Instant;

@Entity
@Table(name = "favorites")
public class Favorites {
    @EmbeddedId
    private FavoriteId id;

    @Column(name = "created_at")
    @CreationTimestamp
    private Instant createdAt;

    public FavoriteId getId() {
        return id;
    }

    public void setId(FavoriteId id) {
        this.id = id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

}
