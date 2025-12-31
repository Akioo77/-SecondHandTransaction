package org.zyq.transaction.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    public SecurityConfig() {
    }
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.formLogin(AbstractHttpConfigurer::disable);
        http.exceptionHandling(e -> e.authenticationEntryPoint((request, response, authException) -> {
            response.setStatus(401);
            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().write("{\"state\":\"401\",\"message\":\"Unauthorized\"}");
        }));
        http.csrf(AbstractHttpConfigurer::disable);
        return http.build();
    }

}
