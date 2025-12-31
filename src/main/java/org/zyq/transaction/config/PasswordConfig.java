package org.zyq.transaction.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        int saltLength = 16;
        int hashLength = 255;
        int parallelism = 1;
        int memory = 65536;
        int iterations = 3;
        return new BCryptPasswordEncoder();
//        return new Argon2PasswordEncoder(saltLength, hashLength, parallelism, memory, iterations);

    }}
