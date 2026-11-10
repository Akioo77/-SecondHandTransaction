package org.zyq.transaction.config;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 管理后台会话登记处。
 *
 * <p>登录成功后由服务端签发随机 token 并登记在这里；客户端 cookie 里的
 * admin_session 值必须与服务端登记的 token 严格相等且未过期才会被放行。</p>
 *
 * <p>历史问题：旧实现只判断 cookie 是否以 "admin" 开头，等于手工构造一个
 * admin_session=admin 的 cookie 就能直接访问 /api/admin/**，登录形同虚设。
 * 现在改为服务端签发 + 严格校验 + 自动过期。</p>
 */
@Component
public class AdminSessionRegistry {

    /** 会话有效期 */
    private static final Duration TTL = Duration.ofHours(2);

    private static final SecureRandom RANDOM = new SecureRandom();

    /** token -> 过期时间 */
    private final Map<String, Instant> sessions = new ConcurrentHashMap<>();

    /**
     * 签发一个新的会话 token。
     *
     * @return 32 字节随机数经 Base64URL 编码后的 token
     */
    public String issue() {
        byte[] buf = new byte[32];
        RANDOM.nextBytes(buf);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
        sessions.put(token, Instant.now().plus(TTL));
        return token;
    }

    /**
     * 校验 token 是否已登记且未过期。
     *
     * @param token 客户端提交上来的 cookie 值
     * @return 有效返回 true
     */
    public boolean isValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Instant expiry = sessions.get(token);
        if (expiry == null) {
            return false;
        }
        if (Instant.now().isAfter(expiry)) {
            sessions.remove(token);
            return false;
        }
        return true;
    }

    /**
     * 让某个 token 立即失效（登出用）。
     */
    public void revoke(String token) {
        if (token != null) {
            sessions.remove(token);
        }
    }
}
