package org.zyq.transaction.transaction.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zyq.transaction.common.exception.ApiException;
import org.zyq.transaction.transaction.dto.ProductControllerDto;
import org.zyq.transaction.transaction.entity.Product;
import org.zyq.transaction.transaction.entity.ProductStats;
import org.zyq.transaction.transaction.entity.ProductView;
import org.zyq.transaction.transaction.repository.CategoryRepository;
import org.zyq.transaction.transaction.repository.ProductRepository;
import org.zyq.transaction.transaction.repository.ProductStatsRepository;
import org.zyq.transaction.transaction.repository.ProductViewRepository;
import org.zyq.transaction.transaction.vo.ProductVO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductStatsRepository productStatsRepository;
    private final ProductViewRepository productViewRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ProductStatsRepository productStatsRepository,
                          ProductViewRepository productViewRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productStatsRepository = productStatsRepository;
        this.productViewRepository = productViewRepository;
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

        Product saved = productRepository.save(product);

        // 初始化 stats 记录（确保浏览量、销量统计能正常工作）
        ProductStats stats = new ProductStats();
        stats.setProductId(saved.getId());
        stats.setViewCount(0L);
        stats.setFavoriteCount(0L);
        stats.setOrderCount(0L);
        stats.setOrderAmount(BigDecimal.ZERO);
        stats.setUpdatedAt(LocalDateTime.now());
        productStatsRepository.save(stats);

        return ProductVO.from(saved);
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

    @Transactional
    public void recordView(Long productId, Long userId, Integer durationSeconds) {
        // 记录浏览明细（含停留时长）
        ProductView view = new ProductView();
        view.setProductId(productId);
        view.setUserId(userId);
        view.setViewedAt(LocalDateTime.now());
        if (durationSeconds != null && durationSeconds > 0) {
            view.setDurationSeconds(durationSeconds);
        }
        productViewRepository.save(view);

        // 累计浏览量（使用增量 SQL，避免加载全表）
        ProductStats stats = productStatsRepository.findById(productId)
                .orElseGet(() -> { ProductStats s = new ProductStats(); s.setProductId(productId); return s; });
        stats.setViewCount(stats.getViewCount() + 1);
        stats.setUpdatedAt(LocalDateTime.now());

        // 更新平均停留时长（使用聚合 SQL，只查同商品有时长记录的平均值）
        if (durationSeconds != null && durationSeconds > 0) {
            Double avg = productViewRepository.calcAvgDurationByProductId(productId);
            if (avg != null) {
                stats.setAvgViewDuration(avg);
            }
        }
        productStatsRepository.save(stats);
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
        // Server path (e.g. /uploads/xxx.png) or external URL — store as-is
        if (trimmed.startsWith("/") || trimmed.startsWith("http")) {
            return trimmed;
        }
        // Base64 data URI
        if (trimmed.startsWith("data:")) {
            int commaIndex = trimmed.indexOf(',');
            if (commaIndex <= 0 || commaIndex == trimmed.length() - 1) {
                throw badRequest("images data URI is invalid");
            }
            String base64 = trimmed.substring(commaIndex + 1);
            if (!isBase64(base64)) {
                throw badRequest("images must be base64");
            }
            return trimmed;
        }
        // Plain non-base64 string (should not reach here)
        throw badRequest("images must be base64 or a URL path");
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
