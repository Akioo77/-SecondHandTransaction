package org.zyq.transaction.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AdminAuthInterceptor adminAuthInterceptor;

    /**
     * 允许跨域访问的来源，逗号分隔。
     *
     * <p>生产环境前端与 /api/ 同源（都走 Nginx 的 80 端口），实际上用不到跨域；
     * 保留这个配置是为了本地开发（localhost:3000）。</p>
     */
    @Value("${cors.allowed-origins:http://localhost:3000,http://124.220.49.156}")
    private String allowedOrigins;

    public WebConfig(AdminAuthInterceptor adminAuthInterceptor) {
        this.adminAuthInterceptor = adminAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 之前这个拦截器从未注册，导致 /api/admin/** 完全没有后端鉴权
        registry.addInterceptor(adminAuthInterceptor).addPathPatterns("/api/admin/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = allowedOrigins.split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
        }
        registry.addMapping("/**")
                // 之前用的是 allowedOriginPatterns("*") + allowCredentials(true)，
                // 等于允许任意站点带凭证跨域调用接口；改为显式白名单
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
