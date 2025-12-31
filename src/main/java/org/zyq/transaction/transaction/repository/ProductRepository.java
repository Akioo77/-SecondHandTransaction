package org.zyq.transaction.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zyq.transaction.transaction.entity.Product;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("""
            select p from Product p
            where (p.isDeleted = 0 or p.isDeleted is null)
              and (:categoryId is null or p.categoryId = :categoryId)
              and (:sellerId is null or p.sellerId = :sellerId)
              and (:keyword is null or lower(p.title) like lower(concat('%', :keyword, '%')))
            order by p.createdAt desc
            """)
    List<Product> search(@Param("categoryId") Long categoryId,
                         @Param("sellerId") Long sellerId,
                         @Param("keyword") String keyword);

    @Query("""
            select p from Product p
            where p.id = :id and (p.isDeleted = 0 or p.isDeleted is null)
            """)
    Optional<Product> findActiveById(@Param("id") Long id);
}
