package org.zyq.transaction.transaction.service;

import org.springframework.stereotype.Service;
import org.zyq.transaction.common.exception.ApiException;
import org.zyq.transaction.transaction.dto.ReviewControllerDto;
import org.zyq.transaction.transaction.entity.Order;
import org.zyq.transaction.transaction.entity.OrderStatus;
import org.zyq.transaction.transaction.entity.Review;
import org.zyq.transaction.transaction.repository.OrderRepository;
import org.zyq.transaction.transaction.repository.ReviewRepository;
import org.zyq.transaction.transaction.vo.ReviewVO;

import java.time.LocalDateTime;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
    }

    public ReviewVO create(ReviewControllerDto.CreateRequest request) {
        Long orderId = requirePositiveId(request.orderId(), "orderId");
        int rating = requireRating(request.rating());
        String content = request.content();

        Order order = requireOrder(orderId);
        if (!order.getStatus().equals(OrderStatus.COMPLETED)) {
            throw new ApiException(409, "Conflict", "order is not completed");
        }
        if (reviewRepository.existsByOrderId(orderId)) {
            throw new ApiException(409, "Conflict", "review already exists");
        }

        Review review = new Review();
        review.setOrderId(orderId);
        review.setRating(rating);
        review.setContent(content);
        review.setCreatedAt(LocalDateTime.now());

        return ReviewVO.from(reviewRepository.save(review));
    }

    public ReviewVO get(Long id) {
        return ReviewVO.from(requireReview(id));
    }

    public ReviewVO getByOrderId(Long orderId) {
        return ReviewVO.from(reviewRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Review for order " + orderId + " not found")));
    }

    private Review requireReview(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Review " + id + " not found"));
    }

    private Order requireOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Order " + id + " not found"));
    }

    private Long requirePositiveId(Long id, String field) {
        if (id == null || id <= 0) {
            throw badRequest(field + " is required");
        }
        return id;
    }

    private int requireRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw badRequest("rating must be between 1 and 5");
        }
        return rating;
    }

    private ApiException badRequest(String reason) {
        return new ApiException(400, "Bad Request", reason);
    }
}
