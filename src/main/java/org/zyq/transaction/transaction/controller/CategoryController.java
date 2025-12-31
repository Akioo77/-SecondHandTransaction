package org.zyq.transaction.transaction.controller;

import org.springframework.web.bind.annotation.*;
import org.zyq.transaction.transaction.dto.CategoryControllerDto;
import org.zyq.transaction.transaction.service.CategoryService;
import org.zyq.transaction.transaction.vo.CategoeyVO;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public CategoeyVO create(@RequestBody CategoryControllerDto.CreateRequest request) {
        return categoryService.create(request);
    }

    @GetMapping("/{id}")
    public CategoeyVO get(@PathVariable Long id) {
        return categoryService.get(id);
    }

    @GetMapping
    public List<CategoeyVO> list() {
        return categoryService.list();
    }

    @PutMapping("/{id}")
    public CategoeyVO update(@PathVariable Long id,
                             @RequestBody CategoryControllerDto.UpdateRequest request) {
        return categoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}
