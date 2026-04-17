package org.zyq.transaction.transaction.dto;

public final class OrderControllerDto {

    private OrderControllerDto() {
    }

    public record CreateRequest(Long productId, Long buyerId, Integer quantity) {
    }

    public record UpdateStatusRequest(Integer status, Long userId) {
    }

    public record UpdateShippingRequest(
            Long buyerId,
            String receiverName,
            String receiverPhone,
            String receiverAddress
    ) {
    }
}
