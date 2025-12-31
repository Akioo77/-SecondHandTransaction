package org.zyq.transaction.transaction.controller;

import org.springframework.web.bind.annotation.*;
import org.zyq.transaction.transaction.dto.OrderControllerDto;
import org.zyq.transaction.transaction.service.OrderService;
import org.zyq.transaction.transaction.vo.OrderVO;
import org.zyq.transaction.transaction.vo.SalesSummaryVO;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public OrderVO create(@RequestBody OrderControllerDto.CreateRequest request) {
        return orderService.create(request);
    }

    @GetMapping("/{id}")
    public OrderVO get(@PathVariable Long id) {
        return orderService.get(id);
    }

    @GetMapping
    public List<OrderVO> list(
            @RequestParam(required = false) Long buyerId,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) Integer status) {
        return orderService.list(buyerId, sellerId, status);
    }

    @GetMapping("/sales-summary")
    public SalesSummaryVO salesSummary(@RequestParam Long sellerId) {
        return orderService.salesSummary(sellerId);
    }

    @GetMapping("/seller/{sellerId}/shipping")
    public List<OrderVO> listShippingBySeller(@PathVariable Long sellerId,
                                              @RequestParam(required = false) Integer status) {
        return orderService.listShippingBySeller(sellerId, status);
    }

    @PatchMapping("/{id}/status")
    public OrderVO updateStatus(@PathVariable Long id,
                                @RequestBody OrderControllerDto.UpdateStatusRequest request) {
        return orderService.updateStatus(id, request);
    }

    @PatchMapping("/{id}/shipping")
    public OrderVO updateShipping(@PathVariable Long id,
                                  @RequestBody OrderControllerDto.UpdateShippingRequest request) {
        return orderService.updateShipping(id, request);
    }
}
