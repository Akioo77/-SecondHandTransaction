package org.zyq.transaction.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "username", unique = true, nullable = false, length = 32)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private Instant createdAt;

    @Column(name = "last_login_ip", length = 64)
    private String lastLoginIp;

    @Column(name = "last_login_province", length = 64)
    private String lastLoginProvince;

    @Column(name = "last_login_city", length = 64)
    private String lastLoginCity;

    // Getters and Setters

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getLastLoginIp() {
        return lastLoginIp;
    }

    public void setLastLoginIp(String lastLoginIp) {
        this.lastLoginIp = lastLoginIp;
    }

    public String getLastLoginProvince() {
        return lastLoginProvince;
    }

    public void setLastLoginProvince(String lastLoginProvince) {
        this.lastLoginProvince = lastLoginProvince;
    }

    public String getLastLoginCity() {
        return lastLoginCity;
    }

    public void setLastLoginCity(String lastLoginCity) {
        this.lastLoginCity = lastLoginCity;
    }

    // ---- 静态工具：从请求中提取真实客户端 IP ----
    public static String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            // 可能有多个 IP，第一个是原始客户端
            String ip = xff.split(",")[0].trim();
            return normalizeIp(ip);
        }
        return normalizeIp(request.getRemoteAddr());
    }

    // 统一格式：支持 IPv6 环回 + IPv6 映射格式 IPv4
    private static String normalizeIp(String addr) {
        if (addr == null) return "unknown";
        if ("0:0:0:0:0:0:0:1".equals(addr) || "::1".equals(addr)) {
            return "127.0.0.1";
        }
        // ::ffff:192.168.x.x → 提取末尾 IPv4
        if (addr.startsWith("::ffff:")) {
            String ip = addr.substring(7);
            if (ip.matches("\\d+\\.\\d+\\.\\d+\\.\\d+")) {
                return ip;
            }
            return ip;
        }
        // 超过 45 字符的非法长度直接截断
        if (addr.length() > 45) {
            return addr.substring(0, 45);
        }
        return addr;
    }

}
