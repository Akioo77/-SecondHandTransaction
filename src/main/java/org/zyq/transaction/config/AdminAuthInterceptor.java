package org.zyq.transaction.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 管理后台权限拦截器。
 *
 * <p>校验 admin_session cookie：必须与服务端登记的会话 token 严格相等且未过期，
 * 才允许访问 /api/admin/**。/api/admin/login 与 /api/admin/logout 放行。</p>
 *
 * <p>历史问题：旧实现只判断 cookie 是否以 "admin" 开头，手工构造
 * admin_session=admin 即可绕过登录；而且这个拦截器当时根本没有注册，
 * 导致 /api/admin/** 实际上完全没有后端鉴权。现在两者都已修复。</p>
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private final AdminSessionRegistry sessions;

    public AdminAuthInterceptor(AdminSessionRegistry sessions) {
        this.sessions = sessions;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();

        // 登录 / 登出接口本身放行
        if (path.equals("/api/admin/login") || path.equals("/api/admin/logout")) {
            return true;
        }
        // 非管理后台路径放行
        if (!path.startsWith("/api/admin")) {
            return true;
        }

        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("admin_session".equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }

        // 必须是服务端签发、仍在有效期内的 token
        if (!sessions.isValid(token)) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未登录或会话已过期\"}");
            return false;
        }
        return true;
    }
}
