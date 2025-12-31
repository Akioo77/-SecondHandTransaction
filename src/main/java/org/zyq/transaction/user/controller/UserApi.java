package org.zyq.transaction.user.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zyq.transaction.common.exception.ApiException;
import org.zyq.transaction.user.dto.ArgDTO;
import org.zyq.transaction.user.service.UserService;
import org.zyq.transaction.user.vo.UserVO;

@RestController
@RequestMapping("/api/users")
public class UserApi {

    private final UserService userService;

    public UserApi(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public UserVO.UserProfile getUserProfile(HttpServletRequest request) {
        Long id = null;
        Cookie[] cookies = request.getCookies();
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("ID")) {
                id = Long.parseLong(cookie.getValue());
                break;
            }
        }
        if (id == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST.value(), "Error", "User ID cookie not found");
        }
        return userService.getProfile(id);
    }

    @PostMapping("/updatePassword")
    public ResponseEntity updatePassword(long id, @RequestBody ArgDTO.UpdatePasswordArg arg) {
        if (userService.updatePassword(id, arg.newPassword())) {
            return ResponseEntity.ok("Password updated successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/favorites/")
    public ResponseEntity listFavorites(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        Long userId = null;
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("ID")) {
                userId = Long.parseLong(cookie.getValue());
                break;
            }
        }
        if (userId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST.value(), "Error", "User ID cookie not found");
        }
        return ResponseEntity.ok(userService.getFavorites(userId));
    }

    @PostMapping("/favorites/add")
    public ResponseEntity addFavorite(HttpServletRequest request, @RequestBody ArgDTO.AddFavoriteArg arg) {
        Cookie[] cookies = request.getCookies();
        Long userId = null;
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("ID")) {
                userId = Long.parseLong(cookie.getValue());
                break;
            }
        }
        if (userId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST.value(), "Error", "User ID cookie not found");
        }
        if (userService.addFavorite(userId, arg.itemId())) {
            return ResponseEntity.ok("Item added to favorites");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/favorites/remove")
    public ResponseEntity removeFavorite(HttpServletRequest request, @RequestBody ArgDTO.RemoveFavoriteArg arg) {
        Cookie[] cookies = request.getCookies();
        Long userId = null;
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("ID")) {
                userId = Long.parseLong(cookie.getValue());
                break;
            }
        }
        if (userId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST.value(), "Error", "User ID cookie not found");
        }
        if (userService.removeFavorite(userId, arg.itemId())) {
            return ResponseEntity.ok("Item removed from favorites");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/favorites/isFavorite")
    public ResponseEntity isFavorite(HttpServletRequest request, @RequestBody ArgDTO.RemoveFavoriteArg arg) {
        Cookie[] cookies = request.getCookies();
        Long userId = null;
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("ID")) {
                userId = Long.parseLong(cookie.getValue());
                break;
            }
        }
        if (userId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST.value(), "Error", "User ID cookie not found");
        }
        boolean favorite = userService.isFavorite(userId, arg.itemId());
        if (favorite){
            return ResponseEntity.ok("Item is in favorites");
        }else  {
            return ResponseEntity.badRequest().build();
        }
    }

}
