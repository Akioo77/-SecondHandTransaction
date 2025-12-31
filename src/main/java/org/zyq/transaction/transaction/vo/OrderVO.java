package org.zyq.transaction.transaction.vo;

import org.zyq.transaction.transaction.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderVO(
        Long id,
        String orderNo,
        Long productId,
        Long buyerId,
        Long sellerId,
        Integer quantity,
        BigDecimal totalPrice,
        Integer status,
        String receiverName,
        String receiverPhone,
        String receiverAddress,
        LocalDateTime createdAt
) {
    public static OrderVO from(Order order) {
        return new OrderVO(
                order.getId(),
                order.getOrderNo(),
                order.getProductId(),
                order.getBuyerId(),
                order.getSellerId(),
                order.getQuantity(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getReceiverName(),
                order.getReceiverPhone(),
                order.getReceiverAddress(),
                order.getCreatedAt()
        );
    }
}
