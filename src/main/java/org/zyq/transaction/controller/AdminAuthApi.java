package org.zyq.transaction.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zyq.transaction.transaction.common.Result;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthApi {

    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin";

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (ADMIN_USERNAME.equals(username) && ADMIN_PASSWORD.equals(password)) {
            return ResponseEntity.ok(Map.of("code", 0, "message", "Login success"));
        }
        return ResponseEntity.badRequest().body(Map.of("code", 400, "message", "username or password incorrect"));
    }
}