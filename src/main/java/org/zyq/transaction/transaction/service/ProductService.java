package org.zyq.transaction.transaction.service;

import org.springframework.stereotype.Service;
import org.zyq.transaction.common.exception.ApiException;
import org.zyq.transaction.transaction.dto.ProductControllerDto;
import org.zyq.transaction.transaction.entity.Product;
import org.zyq.transaction.transaction.repository.CategoryRepository;
import org.zyq.transaction.transaction.repository.ProductRepository;
import org.zyq.transaction.transaction.vo.ProductVO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public ProductVO create(ProductControllerDto.CreateRequest request) {
        Long sellerId = requirePositiveId(request.sellerId(), "sellerId");
        Long categoryId = requirePositiveId(request.categoryId(), "categoryId");
        String title = requireTitle(request.title());
        BigDecimal price = requirePrice(request.price());
        Integer quantity = requireQuantity(request.quantity(), false);

        requireCategory(categoryId);

        Product product = new Product();
        product.setSellerId(sellerId);
        product.setCategoryId(categoryId);
        product.setTitle(title);
        product.setPrice(price);
        product.setQuantity(quantity);
        product.setImages(normalizeImagesBase64(request.images()));
        product.setIsDeleted(0);
        product.setCreatedAt(LocalDateTime.now());

        return ProductVO.from(productRepository.save(product));
    }

    public ProductVO update(Long id, ProductControllerDto.UpdateRequest request) {
        Product product = requireActiveProduct(id);

        if (request.categoryId() != null) {
            requireCategory(request.categoryId());
            product.setCategoryId(request.categoryId());
        }

        if (request.title() != null) {
            product.setTitle(requireTitle(request.title()));
        }

        if (request.price() != null) {
            product.setPrice(requirePrice(request.price()));
        }

        if (request.quantity() != null) {
            int quantity = requireQuantity(request.quantity(), true);
            product.setQuantity(quantity);
            if (quantity == 0) {
                product.setIsDeleted(1);
            }
        }

        if (request.images() != null) {
            product.setImages(normalizeImagesBase64(request.images()));
        }

        if (request.isDeleted() != null) {
            int isDeleted = request.isDeleted();
            if (isDeleted != 0 && isDeleted != 1) {
                throw badRequest("isDeleted must be 0 or 1");
            }
            product.setIsDeleted(isDeleted);
        }

        return ProductVO.from(productRepository.save(product));
    }

    public ProductVO updateBySeller(Long id, Long sellerId, ProductControllerDto.UpdateRequest request) {
        Long requiredSellerId = requirePositiveId(sellerId, "sellerId");
        Product product = requireActiveProduct(id);
        if (!requiredSellerId.equals(product.getSellerId())) {
            throw new ApiException(403, "Forbidden", "sellerId does not match product owner");
        }
        return update(id, request);
    }

    public void delete(Long id) {
        Product product = requireActiveProduct(id);
        product.setIsDeleted(1);
        productRepository.save(product);
    }

    public ProductVO get(Long id) {
        return ProductVO.from(requireActiveProduct(id));
    }

    public List<ProductVO> list(Long categoryId, Long sellerId, String keyword) {
        String normalizedKeyword = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return productRepository.search(categoryId, sellerId, normalizedKeyword)
                .stream()
                .map(ProductVO::from)
                .toList();
    }

    private Product requireActiveProduct(Long id) {
        return productRepository.findActiveById(id)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Product " + id + " not found"));
    }

    private void requireCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ApiException(404, "Not Found", "Category " + categoryId + " not found");
        }
    }

    private Long requirePositiveId(Long id, String field) {
        if (id == null || id <= 0) {
            throw badRequest(field + " is required");
        }
        return id;
    }

    private String requireTitle(String title) {
        if (title == null || title.isBlank()) {
            throw badRequest("title is required");
        }
        return title.trim();
    }

    private BigDecimal requirePrice(BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw badRequest("price must be greater than 0");
        }
        return price;
    }

    private int requireQuantity(Integer quantity, boolean allowZero) {
        if (quantity == null) {
            throw badRequest("quantity is required");
        }
        if (quantity < 0 || (!allowZero && quantity == 0)) {
            throw badRequest("quantity must be greater than 0");
        }
        return quantity;
    }

    private String normalizeImagesBase64(String images) {
        if (images == null || images.isBlank()) {
            return null;
        }
        String trimmed = images.trim();
        String base64 = trimmed;
        if (trimmed.startsWith("data:")) {
            int commaIndex = trimmed.indexOf(',');
            if (commaIndex <= 0 || commaIndex == trimmed.length() - 1) {
                throw badRequest("images data URI is invalid");
            }
            base64 = trimmed.substring(commaIndex + 1);
        }
        if (!isBase64(base64)) {
            throw badRequest("images must be base64");
        }
        return trimmed;
    }

    private boolean isBase64(String value) {
        try {
            Base64.getDecoder().decode(value);
            return true;
        } catch (IllegalArgumentException ex) {
            try {
                Base64.getUrlDecoder().decode(value);
                return true;
            } catch (IllegalArgumentException ignored) {
                return false;
            }
        }
    }

    private ApiException badRequest(String reason) {
        return new ApiException(400, "Bad Request", reason);
    }
}
