package org.zyq.transaction.transaction.controller;

import org.springframework.web.bind.annotation.*;
import org.zyq.transaction.transaction.dto.ReviewControllerDto;
import org.zyq.transaction.transaction.service.ReviewService;
import org.zyq.transaction.transaction.vo.ReviewVO;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ReviewVO create(@RequestBody ReviewControllerDto.CreateRequest request) {
        return reviewService.create(request);
    }

    @GetMapping("/{id}")
    public ReviewVO get(@PathVariable Long id) {
        return reviewService.get(id);
    }

    @GetMapping("/by-order/{orderId}")
    public ReviewVO getByOrder(@PathVariable Long orderId) {
        return reviewService.getByOrderId(orderId);
    }
}
