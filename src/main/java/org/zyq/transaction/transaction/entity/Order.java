package org.zyq.transaction.transaction.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true, length = 32)
    private String orderNo;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private Integer status = 10; // 10已下单 40完成 50取消

    @Column(name = "receiver_name", length = 50)
    private String receiverName;

    @Column(name = "receiver_phone", length = 32)
    private String receiverPhone;

    @Column(name = "receiver_address", length = 255)
    private String receiverAddress;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    //setter and getter
    public Long getId() {return id; }

    public void setId(Long id) {this.id = id; }

    public String getOrderNo() {return orderNo; }

    public void setOrderNo(String orderNo) {this.orderNo = orderNo; }

    public Long getProductId() {return productId; }

    public void setProductId(Long productId) {this.productId = productId; }

    public Long getBuyerId() {return buyerId; }

    public void setBuyerId(Long buyerId) {this.buyerId = buyerId; }

    public Long getSellerId() {return sellerId; }

    public void setSellerId(Long sellerId) {this.sellerId = sellerId; }

    public Integer getQuantity() {return quantity; }

    public void setQuantity(Integer quantity) {this.quantity = quantity; }

    public BigDecimal getTotalPrice() {return totalPrice; }

    public void setTotalPrice(BigDecimal totalPrice) {this.totalPrice = totalPrice; }

    public Integer getStatus() {return status; }

    public void setStatus(Integer status) {this.status = status; }

    public String getReceiverName() { return receiverName; }

    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getReceiverPhone() { return receiverPhone; }

    public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }

    public String getReceiverAddress() { return receiverAddress; }

    public void setReceiverAddress(String receiverAddress) { this.receiverAddress = receiverAddress; }

    public LocalDateTime getCreatedAt() {return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt; }

}
