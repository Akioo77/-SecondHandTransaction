package org.zyq.transaction.user.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP 归属地查询服务
 * 使用 ip-api.com 免费接口（非商业用途免费，45次/分钟）
 * 返回格式：{regionName: "广东省", city: "深圳市", ISP: "Tencent Cloud", ...}
 */
@Service
public class IpGeoService {

    private static final Logger log = LoggerFactory.getLogger(IpGeoService.class);
    private static final String API_URL = "http://ip-api.com/json/";
    private static final int TIMEOUT_MS = 3000;

    // 简单缓存：IP → "广东省深圳市"，避免重复查询
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    /**
     * 查询 IP 的归属地，格式："省/市"
     * 本地 IP（127.0.0.1 / ::1）直接返回 "本地"
     */
    public String lookup(String ip) {
        if (ip == null || ip.isEmpty()) return "未知";
        if ("127.0.0.1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "本地";
        }
        if (cache.containsKey(ip)) return cache.get(ip);

        String location = fetchFromApi(ip);
        cache.put(ip, location);
        return location;
    }

    private String fetchFromApi(String ip) {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(API_URL + ip + "?fields=status,message,country,regionName,city");
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            conn.setRequestProperty("User-Agent", "SecondHandApp/1.0");

            int code = conn.getResponseCode();
            if (code != 200) {
                log.warn("IP查询接口返回状态码 {}，IP={}", code, ip);
                return "未知";
            }

            String body = new String(conn.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            // 简单解析 JSON：{"status":"fail"} 或 {"status":"success","regionName":"广东省","city":"深圳市"}
            if (body.contains("\"status\":\"fail\"")) {
                return "未知";
            }

            String province = extractJson(body, "regionName");
            String city = extractJson(body, "city");

            if (province == null || province.isEmpty()) {
                return "未知";
            }
            // 去掉多余的引号和空格
            province = province.replace("\"", "").trim();
            city = (city == null || city.replace("\"", "").trim().isEmpty()) ? "" : city.replace("\"", "").trim();

            return city.isEmpty() ? province : province + "/" + city;

        } catch (Exception e) {
            log.warn("IP归属地查询异常 IP={}，错误={}", ip, e.getMessage());
            return "未知";
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    /** 简单 JSON 字段提取，不依赖外部库 */
    private String extractJson(String json, String key) {
        String pattern = "\"" + key + "\"";
        int idx = json.indexOf(pattern);
        if (idx < 0) return null;
        int colon = json.indexOf(':', idx);
        if (colon < 0) return null;
        int start = colon + 1;
        // 跳过空白
        while (start < json.length() && json.charAt(start) == ' ') start++;
        if (start >= json.length()) return null;
        if (json.charAt(start) == '"') {
            // 字符串值
            int end = json.indexOf('"', start + 1);
            return end > start ? json.substring(start, end + 1) : null;
        } else {
            // 非字符串值（数字等）
            int end = start;
            while (end < json.length() && json.charAt(end) != ',' && json.charAt(end) != '}') end++;
            return json.substring(start, end).trim();
        }
    }
}
