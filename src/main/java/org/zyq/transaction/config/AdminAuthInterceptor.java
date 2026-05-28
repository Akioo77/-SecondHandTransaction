package org.zyq.transaction.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 管理后台权限拦截器
 * 校验 admin_session cookie，只有 admin_session=admin 才允许访问 /api/admin/**
 * /api/admin/login 路径放行（无需登录）
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                              HttpServletResponse response,
                              Object handler) throws Exception {
        String path = request.getRequestURI();
        // /api/admin/login 放行
        if (path.equals("/api/admin/login")) {
            return true;
        }
        // 非 /api/admin 路径放行
        if (!path.startsWith("/api/admin")) {
            return true;
        }
        // 读取 admin_session cookie
        Cookie[] cookies = request.getCookies();
        String adminSession = null;
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("admin_session".equals(c.getName())) {
                    adminSession = c.getValue();
                    break;
                }
            }
        }
        if (adminSession == null || !adminSession.startsWith("admin")) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未登录或无权限\"}");
            return false;
        }
        return true;
    }
}