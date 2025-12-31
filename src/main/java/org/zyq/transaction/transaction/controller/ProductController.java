package org.zyq.transaction.transaction.controller;

import org.springframework.web.bind.annotation.*;
import org.zyq.transaction.transaction.dto.ProductControllerDto;
import org.zyq.transaction.transaction.service.ProductService;
import org.zyq.transaction.transaction.vo.ProductVO;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ProductVO create(@RequestBody ProductControllerDto.CreateRequest request) {
        return productService.create(request);
    }

    @GetMapping("/{id}")
    public ProductVO get(@PathVariable Long id) {
        return productService.get(id);
    }

    @GetMapping
    public List<ProductVO> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) String keyword) {
        return productService.list(categoryId, sellerId, keyword);
    }

    @PutMapping("/{id}")
    public ProductVO update(@PathVariable Long id, @RequestBody ProductControllerDto.UpdateRequest request) {
        return productService.update(id, request);
    }

    @PutMapping("/{id}/seller")
    public ProductVO updateBySeller(@PathVariable Long id,
                                    @RequestParam Long sellerId,
                                    @RequestBody ProductControllerDto.UpdateRequest request) {
        return productService.updateBySeller(id, sellerId, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}
