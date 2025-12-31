package org.zyq.transaction.user.service.Impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.zyq.transaction.common.exception.ApiException;
import org.zyq.transaction.user.entity.Favorites;
import org.zyq.transaction.user.entity.User;
import org.zyq.transaction.user.entity.composite.FavoriteId;
import org.zyq.transaction.user.repository.FavoritesRepository;
import org.zyq.transaction.user.repository.UserRepository;
import org.zyq.transaction.user.service.UserService;
import org.zyq.transaction.user.vo.UserVO;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final FavoritesRepository favoritesRepo;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, FavoritesRepository favoritesRepository) {
        this.userRepo= userRepository;
        this.passwordEncoder = passwordEncoder;
        this.favoritesRepo = favoritesRepository;
    }

    @Override
    public UserVO.UserProfile getProfile(long id) {
        User user = userRepo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND.value(), "Error", "User not found"));
        return new UserVO.UserProfile(user.getId(),user.getUsername());
    }

    @Override
    public boolean updatePassword(long id,String newPassword) {
        User user = userRepo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND.value(), "Error", "User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
        return true;
    }

    @Override
    public UserVO.FavoritesList getFavorites(long id) {
        List<Favorites> favorites = favoritesRepo.findById_UserId(id);
        List<Long> itemIds = new ArrayList<>();
        for (Favorites fav : favorites) {
            itemIds.add(fav.getId().getProductId());
        }
        return new UserVO.FavoritesList(itemIds);
    }

    @Override
    public boolean addFavorite(long userId, long itemId) {
        try {
            FavoriteId favId = new FavoriteId(userId, itemId);
            Favorites favorite = new Favorites();
            favorite.setId(favId);
            favoritesRepo.save(favorite);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean removeFavorite(long userId, long itemId) {
        try {
            FavoriteId favId = new FavoriteId(userId, itemId);
            favoritesRepo.deleteById(favId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean isFavorite(long userId, long itemId) {
        FavoriteId favId = new FavoriteId(userId, itemId);
        return favoritesRepo.existsById(favId);
    }
}
