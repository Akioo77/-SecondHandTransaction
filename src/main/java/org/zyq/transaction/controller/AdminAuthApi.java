package org.zyq.transaction.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.zyq.transaction.config.AdminSessionRegistry;

import java.util.Map;

/**
 * 管理后台登录 / 登出。
 *
 * <p>管理员账号不再硬编码在源码里，改为从环境变量 {@code ADMIN_USERNAME} /
 * {@code ADMIN_PASSWORD} 读取：未配置时登录一律拒绝，避免默认口令 admin/admin
 * 带来的越权风险。</p>
 *
 * <p>登录成功后由服务端签发随机 token，前端需要把它写进 admin_session cookie，
 * 后续 /api/admin/** 的请求凭该 token 鉴权。</p>
 */
@RestController
@RequestMapping("/api/admin")
public class AdminAuthApi {

    private final AdminSessionRegistry sessions;

    @Value("${admin.auth.username:}")
    private String adminUsername;

    @Value("${admin.auth.password:}")
    private String adminPassword;

    public AdminAuthApi(AdminSessionRegistry sessions) {
        this.sessions = sessions;
    }

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body) {
        // 未配置管理员凭据时直接禁用登录，而不是退回默认口令
        if (adminUsername == null || adminUsername.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            return ResponseEntity.status(503).body(Map.of(
                    "code", 503,
                    "message", "管理后台未配置管理员凭据，登录已禁用"));
        }

        String username = body.get("username");
        String password = body.get("password");
        if (!adminUsername.equals(username) || !adminPassword.equals(password)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "code", 400,
                    "message", "username or password incorrect"));
        }

        String token = sessions.issue();
        return ResponseEntity.ok(Map.of(
                "code", 0,
                "message", "Login success",
                "token", token));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> adminLogout(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("admin_session".equals(c.getName())) {
                    sessions.revoke(c.getValue());
                }
            }
        }
        return ResponseEntity.ok(Map.of("code", 0, "message", "Logout success"));
    }
}
