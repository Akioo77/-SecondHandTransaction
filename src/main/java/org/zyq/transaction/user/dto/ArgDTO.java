package org.zyq.transaction.user.dto;

public class ArgDTO {
    public record RegisterArg(String username, String password) {}
    public record LoginArg(String username, String password) {}
    public record UpdatePasswordArg( String newPassword) {}
    public record AddFavoriteArg(long id,long itemId) {}
    public record RemoveFavoriteArg(long id, long itemId) {}
}
