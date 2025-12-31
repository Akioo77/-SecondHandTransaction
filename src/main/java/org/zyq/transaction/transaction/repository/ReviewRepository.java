package org.zyq.transaction.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zyq.transaction.transaction.entity.Review;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);
}
