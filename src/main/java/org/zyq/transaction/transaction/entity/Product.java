package org.zyq.transaction.transaction.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    private String title;
    private BigDecimal price;
    private Integer quantity;

    @Lob
    @Column(columnDefinition = "longtext")
    private String images;

    @Column(name = "is_deleted")
    private Integer isDeleted;

    private LocalDateTime createdAt;


    //seter and getter
    public long getId() { return id; }

    public void setId(long id) { this.id = id; }

    public long getSellerId() { return sellerId; }

    public void setSellerId(long sellerId) { this.sellerId = sellerId; }

    public long getCategoryId() { return categoryId; }

    public void setCategoryId(long categoryId) { this.categoryId = categoryId; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public BigDecimal getPrice() { return price; }

    public void setPrice(BigDecimal price) { this.price = price; }

    public int getQuantity() { return quantity; }

    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getImages() { return images; }

    public void setImages(String images) { this.images = images; }

    public int getIsDeleted() { return isDeleted; }

    public void setIsDeleted(int isDeleted) { this.isDeleted = isDeleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

}
