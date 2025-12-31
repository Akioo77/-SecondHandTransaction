package org.zyq.transaction.user.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.zyq.transaction.user.entity.Favorites;
import org.zyq.transaction.user.entity.composite.FavoriteId;

import java.util.List;

@Repository
public interface FavoritesRepository extends CrudRepository<Favorites, FavoriteId> {
    List<Favorites> findById_UserId(Long idUserId);
}

