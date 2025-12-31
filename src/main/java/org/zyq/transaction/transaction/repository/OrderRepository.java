package org.zyq.transaction.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zyq.transaction.transaction.entity.Order;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("""
            select o from Order o
            where (:buyerId is null or o.buyerId = :buyerId)
              and (:sellerId is null or o.sellerId = :sellerId)
              and (:status is null or o.status = :status)
            order by o.createdAt desc
            """)
    List<Order> search(@Param("buyerId") Long buyerId,
                       @Param("sellerId") Long sellerId,
                       @Param("status") Integer status);
}
