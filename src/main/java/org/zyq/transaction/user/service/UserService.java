package org.zyq.transaction.user.service;

import org.zyq.transaction.user.vo.UserVO;

public interface UserService {

    // 获取用户信息
    UserVO.UserProfile getProfile(long id);
    // 更新用户密码
    boolean updatePassword(long id, String newPassword);
    // 查看收藏物品
    UserVO.FavoritesList getFavorites(long id);
    // 添加收藏物品
    boolean addFavorite(long userId, long itemId);
    // 移除收藏物品
    boolean removeFavorite(long userId, long itemId);
    // 是否收藏了某物品
    boolean isFavorite(long userId, long itemId);
}
