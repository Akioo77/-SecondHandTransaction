package org.zyq.transaction.transaction;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataFixRunner implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // 已禁用，改用 API 手动创建数据
    }
}
