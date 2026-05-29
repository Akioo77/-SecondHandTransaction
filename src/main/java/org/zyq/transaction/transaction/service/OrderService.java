package org.zyq.transaction.transaction.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zyq.transaction.common.exception.ApiException;
import org.zyq.transaction.transaction.dto.OrderControllerDto;
import org.zyq.transaction.transaction.entity.Order;
import org.zyq.transaction.transaction.entity.OrderStatus;
import org.zyq.transaction.transaction.entity.Product;
import org.zyq.transaction.transaction.entity.ProductStats;
import org.zyq.transaction.transaction.repository.OrderRepository;
import org.zyq.transaction.transaction.repository.ProductRepository;
import org.zyq.transaction.transaction.repository.ProductStatsRepository;
import org.zyq.transaction.transaction.vo.OrderVO;
import org.zyq.transaction.transaction.vo.SalesSummaryVO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderService {

    private static final DateTimeFormatter ORDER_NO_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");
    private static final Set<Integer> UPDATE_STATUSES =
            Set.of(OrderStatus.COMPLETED, OrderStatus.CANCELED);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductStatsRepository productStatsRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        ProductStatsRepository productStatsRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.productStatsRepository = productStatsRepository;
    }


    @Transactional
    public OrderVO create(OrderControllerDto.CreateRequest request) {
        return create(request, null);
    }

    @Transactional
    public OrderVO create(OrderControllerDto.CreateRequest request, String ip) {
        Long productId = requirePositiveId(request.productId(), "productId");
        Long buyerId = requirePositiveId(request.buyerId(), "buyerId");
        int quantity = requireQuantity(request.quantity());

        // 用悲观锁查询商品（防止并发超卖）
        Product product = productRepository.findActiveByIdForUpdate(productId)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Product " + productId + " not found"));

        // 不能购买自己发布的商品
        if (buyerId.equals(product.getSellerId())) {
            throw new ApiException(400, "BadRequest", "不能购买自己发布的商品");
        }

        if (product.getPrice() == null) {
            throw badRequest("product price is missing");
        }

        if (product.getQuantity() < quantity) {
            throw new ApiException(409, "Conflict", "insufficient stock");
        }

        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setProductId(product.getId());
        order.setBuyerId(buyerId);
        order.setSellerId(product.getSellerId());
        order.setQuantity(quantity);
        order.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
        order.setStatus(OrderStatus.PLACED);
        order.setCreatedAt(LocalDateTime.now());
        order.setIpAddress(ip);

        int remaining = product.getQuantity() - quantity;
        product.setQuantity(remaining);
        productRepository.save(product);
        return OrderVO.from(orderRepository.save(order));
    }

    public OrderVO get(Long id) {
        return OrderVO.from(requireOrder(id));
    }

    public List<OrderVO> list(Long buyerId, Long sellerId, Integer status) {
        return orderRepository.search(buyerId, sellerId, status)
                .stream()
                .map(OrderVO::from)
                .toList();
    }

    public List<OrderVO> listShippingBySeller(Long sellerId, Integer status) {
        Long requiredSellerId = requirePositiveId(sellerId, "sellerId");
        return orderRepository.search(null, requiredSellerId, status)
                .stream()
                .map(OrderVO::from)
                .toList();
    }

    public SalesSummaryVO salesSummary(Long sellerId) {
        Long requiredSellerId = requirePositiveId(sellerId, "sellerId");
        List<Order> orders = orderRepository.search(null, requiredSellerId, OrderStatus.COMPLETED);
        int totalQuantity = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Order order : orders) {
            if (order.getQuantity() != null) {
                totalQuantity += order.getQuantity();
            }
            if (order.getTotalPrice() != null) {
                totalAmount = totalAmount.add(order.getTotalPrice());
            }
        }
        return new SalesSummaryVO(requiredSellerId, totalQuantity, totalAmount);
    }

    @Transactional
    public OrderVO updateStatus(Long id, OrderControllerDto.UpdateStatusRequest request) {
        Integer status = request.status();
        if (status == null) {
            throw badRequest("status is required");
        }
        if (!UPDATE_STATUSES.contains(status)) {
            throw badRequest("status must be 40 or 50");
        }

        Order order = requireOrder(id);

        // ===== 🔒 权限校验：只有买家或卖家可以操作自己的订单 =====
        Long callerId = request.userId();
        if (callerId == null) {
            throw new ApiException(401, "Unauthorized", "userId is required");
        }
        if (!callerId.equals(order.getBuyerId()) && !callerId.equals(order.getSellerId())) {
            throw new ApiException(403, "Forbidden", "you can only update your own order status");
        }

        if (!order.getStatus().equals(OrderStatus.PLACED)) {
            throw new ApiException(409, "Conflict", "order status cannot be changed");
        }

        order.setStatus(status);

        if (status.equals(OrderStatus.CANCELED)) {
            Product product = requireProduct(order.getProductId());
            product.setQuantity(product.getQuantity() + order.getQuantity());
            product.setIsDeleted(0);
            productRepository.save(product);
        }

        if (status.equals(OrderStatus.COMPLETED)) {
            // 更新商品统计
            ProductStats stats = productStatsRepository.findById(order.getProductId())
                    .orElseGet(() -> { ProductStats s = new ProductStats(); s.setProductId(order.getProductId()); return s; });
            stats.setOrderCount(stats.getOrderCount() + order.getQuantity());
            stats.setOrderAmount(stats.getOrderAmount().add(order.getTotalPrice()));
            stats.setUpdatedAt(LocalDateTime.now());
            productStatsRepository.save(stats);
        }

        return OrderVO.from(orderRepository.save(order));
    }

    @Transactional
    public OrderVO updateShipping(Long id, OrderControllerDto.UpdateShippingRequest request) {
        Long buyerId = requirePositiveId(request.buyerId(), "buyerId");
        String receiverName = requireReceiverName(request.receiverName());
        String receiverPhone = requireReceiverPhone(request.receiverPhone());
        String receiverAddress = requireReceiverAddress(request.receiverAddress());

        Order order = requireOrder(id);
        if (!buyerId.equals(order.getBuyerId())) {
            throw new ApiException(403, "Forbidden", "buyerId does not match order owner");
        }
        if (!order.getStatus().equals(OrderStatus.PLACED)) {
            throw new ApiException(409, "Conflict", "order status cannot be changed");
        }

        order.setReceiverName(receiverName);
        order.setReceiverPhone(receiverPhone);
        order.setReceiverAddress(receiverAddress);
        return OrderVO.from(orderRepository.save(order));
    }

    private Order requireOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Order " + id + " not found"));
    }

    private Product requireActiveProduct(Long id) {
        return productRepository.findActiveById(id)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Product " + id + " not found"));
    }

    private Product requireProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Product " + id + " not found"));
    }

    private Long requirePositiveId(Long id, String field) {
        if (id == null || id <= 0) {
            throw badRequest(field + " is required");
        }
        return id;
    }

    private int requireQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw badRequest("quantity must be greater than 0");
        }
        return quantity;
    }

    private String requireReceiverName(String receiverName) {
        if (receiverName == null || receiverName.isBlank()) {
            throw badRequest("receiverName is required");
        }
        return receiverName.trim();
    }

    private String requireReceiverPhone(String receiverPhone) {
        if (receiverPhone == null || receiverPhone.isBlank()) {
            throw badRequest("receiverPhone is required");
        }
        return receiverPhone.trim();
    }

    private String requireReceiverAddress(String receiverAddress) {
        if (receiverAddress == null || receiverAddress.isBlank()) {
            throw badRequest("receiverAddress is required");
        }
        return receiverAddress.trim();
    }

    private String generateOrderNo() {
        String timePart = LocalDateTime.now().format(ORDER_NO_FORMAT);
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 10000);
        return timePart + randomPart;
    }

    private ApiException badRequest(String reason) {
        return new ApiException(400, "Bad Request", reason);
    }
}
