package org.zyq.transaction.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zyq.transaction.transaction.entity.ProductView;
import java.time.LocalDateTime;
import java.util.List;

public interface ProductViewRepository extends JpaRepository<ProductView, Long> {

    // 统计某商品指定日期范围的浏览量
    @Query("""
            select count(pv) from ProductView pv
            where pv.productId = :productId
              and pv.viewedAt between :start and :end
            """)
    Long countByProductIdAndDateRange(@Param("productId") Long productId,
                                      @Param("start") LocalDateTime start,
                                      @Param("end") LocalDateTime end);

    // 统计每日浏览量（趋势图用）
    @Query("""
            select cast(pv.viewedAt as date) as day, count(pv) as cnt
            from ProductView pv
            where pv.viewedAt between :start and :end
            group by cast(pv.viewedAt as date)
            order by day asc
            """)
    List<Object> dailyViewTrend(@Param("start") LocalDateTime start,
                                 @Param("end") LocalDateTime end);

    // 统计某用户看过的商品（推荐用）
    @Query("""
            select pv.productId from ProductView pv
            where pv.userId = :userId
            group by pv.productId
            order by count(pv.productId) desc
            """)
    List<Long> findViewedProductIdsByUserId(@Param("userId") Long userId);

    // 聚合计算某商品所有记录的「有数据」浏览时长的平均值（秒）
    @Query("""
            select avg(pv.durationSeconds) from ProductView pv
            where pv.productId = :productId
              and pv.durationSeconds is not null
            """)
    Double calcAvgDurationByProductId(@Param("productId") Long productId);
}
