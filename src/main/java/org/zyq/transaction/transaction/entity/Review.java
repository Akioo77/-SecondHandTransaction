package org.zyq.transaction.transaction.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(nullable = false)
    private Integer rating; // 1~5

    @Column(length = 255)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    //setter and getter
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }

    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Integer getRating() { return rating; }

    public void setRating(Integer rating) { this.rating = rating; }

    public String getContent() { return content; }

    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

}
