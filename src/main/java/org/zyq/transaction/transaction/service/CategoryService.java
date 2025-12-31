package org.zyq.transaction.transaction.service;

import org.springframework.stereotype.Service;
import org.zyq.transaction.common.exception.ApiException;
import org.zyq.transaction.transaction.dto.CategoryControllerDto;
import org.zyq.transaction.transaction.entity.Category;
import org.zyq.transaction.transaction.repository.CategoryRepository;
import org.zyq.transaction.transaction.vo.CategoeyVO;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public CategoeyVO create(CategoryControllerDto.CreateRequest request) {
        String name = requireName(request.name());
        Category category = new Category();
        category.setName(name);
        return CategoeyVO.from(categoryRepository.save(category));
    }

    public CategoeyVO update(Long id, CategoryControllerDto.UpdateRequest request) {
        Category category = requireCategory(id);
        String name = requireName(request.name());
        category.setName(name);
        return CategoeyVO.from(categoryRepository.save(category));
    }

    public void delete(Long id) {
        Category category = requireCategory(id);
        categoryRepository.delete(category);
    }

    public CategoeyVO get(Long id) {
        return CategoeyVO.from(requireCategory(id));
    }

    public List<CategoeyVO> list() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoeyVO::from)
                .toList();
    }

    private Category requireCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Category " + id + " not found"));
    }

    private String requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new ApiException(400, "Bad Request", "name is required");
        }
        return name.trim();
    }
}
