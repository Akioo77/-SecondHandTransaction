package org.zyq.transaction.user.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.zyq.transaction.user.dto.ArgDTO;
import org.zyq.transaction.user.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthApi {

    private final AuthService authService;

    public AuthApi(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody ArgDTO.RegisterArg arg) {
        if (authService.register(arg.username(), arg.password())) {
            return ResponseEntity.ok("Registration successful");
        }else  {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody ArgDTO.LoginArg arg, HttpServletRequest request, HttpServletResponse response) {
        String ip = org.zyq.transaction.user.entity.User.getClientIp(request);
        Long id = authService.login(arg.username(), arg.password(), ip);
        if (id != null){
            ResponseCookie cookie = ResponseCookie.from("ID", id.toString())
                    .httpOnly(false)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60) // 7 days
                    .build();
            response.addHeader("Set-Cookie", cookie.toString());
            return ResponseEntity.ok("Login successful");
        }else  {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

}
