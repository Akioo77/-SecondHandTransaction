package org.zyq.transaction.transaction.vo;

import org.zyq.transaction.transaction.entity.Category;

public record CategoeyVO(Long id, String name) {
    public static CategoeyVO from(Category category) {
        return new CategoeyVO(category.getId(), category.getName());
    }
}
