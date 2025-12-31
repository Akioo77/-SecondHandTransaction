package org.zyq.transaction.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zyq.transaction.transaction.entity.Category;

public interface CategoryRepository  extends JpaRepository<Category, Long> {
}
