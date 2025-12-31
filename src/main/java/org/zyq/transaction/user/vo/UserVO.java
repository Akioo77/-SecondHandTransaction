package org.zyq.transaction.user.vo;

import org.zyq.transaction.user.entity.Favorites;

import java.util.List;

public class UserVO {
    public record LoginResponse(Long id, String username, String token) {}
    public record RegisterResponse(Long id, String username) {}
    public record UserProfile(Long id, String username) {}
    public record FavoritesList(List<Long> itemId) {}
}
