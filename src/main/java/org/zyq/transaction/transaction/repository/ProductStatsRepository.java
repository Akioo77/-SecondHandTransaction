package org.zyq.transaction.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zyq.transaction.transaction.entity.ProductStats;
import java.util.List;

public interface ProductStatsRepository extends JpaRepository<ProductStats, Long> {

    // 销量排行（按 order_count 降序，有真实销售的商品优先）
    @Query(value="""
            select ps.* from product_stats ps
            join products p on p.id = ps.product_id
            where (p.is_deleted = 0 or p.is_deleted is null)
            order by ps.order_count desc, ps.view_count desc
            LIMIT :limit
            """, nativeQuery=true)
    List<ProductStats> findTopByOrderCount(@Param("limit") int limit);

    // 销售额排行
    @Query("""
            select ps from ProductStats ps
            order by ps.orderAmount desc
            """)
    List<ProductStats> findTopByOrderAmount(@Param("limit") int limit);

    // 浏览量排行
    @Query("""
            select ps from ProductStats ps
            order by ps.viewCount desc
            """)
    List<ProductStats> findTopByViewCount(@Param("limit") int limit);

    // 增量更新浏览量
    @Modifying
    @Query("""
            update ProductStats ps
            set ps.viewCount = ps.viewCount + 1,
                ps.updatedAt = CURRENT_TIMESTAMP
            where ps.productId = :productId
            """)
    void incrementViewCount(@Param("productId") Long productId);

    // 增量更新销量
    @Modifying
    @Query("""
            update ProductStats ps
            set ps.orderCount = ps.orderCount + :quantity,
                ps.orderAmount = ps.orderAmount + :amount,
                ps.updatedAt = CURRENT_TIMESTAMP
            where ps.productId = :productId
            """)
    void incrementOrderStats(@Param("productId") Long productId,
                             @Param("quantity") Long quantity,
                             @Param("amount") java.math.BigDecimal amount);

    // 增量更新收藏数
    @Modifying
    @Query("""
            update ProductStats ps
            set ps.favoriteCount = ps.favoriteCount + 1,
                ps.updatedAt = CURRENT_TIMESTAMP
            where ps.productId = :productId
            """)
    void incrementFavoriteCount(@Param("productId") Long productId);

    // 更新平均停留时长
    @Modifying
    @Query("""
            update ProductStats ps
            set ps.avgViewDuration = :avg,
                ps.updatedAt = CURRENT_TIMESTAMP
            where ps.productId = :productId
            """)
    void updateAvgViewDuration(@Param("productId") Long productId, @Param("avg") Double avg);
}
