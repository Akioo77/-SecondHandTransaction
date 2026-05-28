package org.zyq.transaction.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.zyq.transaction.transaction.service.AdminService;
import org.zyq.transaction.transaction.vo.UserProfileVO;
import org.zyq.transaction.transaction.common.Result;
import org.zyq.transaction.user.entity.User;
import org.zyq.transaction.user.service.IpGeoService;
import org.zyq.transaction.user.repository.UserRepository;
import org.zyq.transaction.common.service.OperationLogService;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String OP_ADMIN = "admin";
    private static final String ROLE_ADMIN = "ADMIN";

    @Autowired
    private AdminService adminService;
    @Autowired
    private IpGeoService ipGeoService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OperationLogService operationLogService;

    private String getClientIp(HttpServletRequest request) {
        return User.getClientIp(request);
    }

    // ==================== 数据查询（不记日志）====================

    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        return Result.success(adminService.getStats());
    }

    @GetMapping("/users")
    public Result<List<Map<String, Object>>> getUsers() {
        return Result.success(adminService.getAllUsers());
    }

    @GetMapping("/products")
    public Result<List<Map<String, Object>>> getProducts() {
        return Result.success(adminService.getAllProducts());
    }

    @GetMapping("/categories")
    public Result<List<Map<String, Object>>> getCategories() {
        return Result.success(adminService.getAllCategories());
    }

    @GetMapping("/orders")
    public Result<List<Map<String, Object>>> getOrders() {
        return Result.success(adminService.getAllOrders());
    }

    @PostMapping("/orders/{id}/cancel")
    public Result<Void> cancelOrder(@PathVariable Long id, HttpServletRequest request) {
        adminService.cancelOrder(id);
        operationLogService.log(OP_ADMIN, ROLE_ADMIN,
                "ORDER_CANCEL",
                String.format("关闭订单 #%d（管理员操作）", id),
                "ORDER", id,
                "status=10", "status=50",
                getClientIp(request));
        return Result.success(null);
    }

    @GetMapping("/sales-trend")
    public Result<Map<String, Object>> getSalesTrend() {
        return Result.success(adminService.getSalesTrend());
    }

    // ==================== 操作（含日志）====================

    @PutMapping("/users/{id}/status")
    public Result<Void> updateUserStatus(@PathVariable Integer id,
                                         @RequestParam Boolean enabled,
                                         HttpServletRequest request) {
        String ip = getClientIp(request);
        org.zyq.transaction.user.entity.User user = userRepository.findById(Long.valueOf(id)).orElse(null);
        String before = user != null ? "enabled=" + !enabled : "unknown";
        adminService.updateUserStatus(id, enabled);
        operationLogService.log(OP_ADMIN, ROLE_ADMIN,
                enabled ? "USER_ENABLE" : "USER_DISABLE",
                String.format("%s %s（#%d）", enabled ? "启用" : "禁用", user != null ? user.getUsername() : id, id),
                "USER", Long.valueOf(id),
                before, "enabled=" + enabled, ip);
        return Result.success(null);
    }

    @PutMapping("/users/{id}/password")
    public Result<Void> updateUserPassword(@PathVariable Integer id,
                                           @RequestBody Map<String, String> body,
                                           HttpServletRequest request) {
        String ip = getClientIp(request);
        String newPassword = body.get("password");
        if (newPassword == null || newPassword.isEmpty()) {
            return Result.error("密码不能为空");
        }
        org.zyq.transaction.user.entity.User user = userRepository.findById(Long.valueOf(id)).orElse(null);
        adminService.updateUserPassword(id, newPassword);
        operationLogService.log(OP_ADMIN, ROLE_ADMIN,
                "USER_PASSWORD_RESET",
                String.format("重置用户 #%d 的密码", id),
                "USER", Long.valueOf(id), ip);
        return Result.success(null);
    }

    @PutMapping("/products/{id}")
    public Result<Void> updateProduct(@PathVariable Integer id,
                                       @RequestBody Map<String, Object> updates,
                                       HttpServletRequest request) {
        String ip = getClientIp(request);

        // 记录修改前各字段（在更新之前读取）
        String before = "";
        try {
            List<Map<String, Object>> prods = adminService.getAllProducts();
            Optional<Map<String, Object>> current = prods.stream()
                    .filter(p -> ((Number) p.get("id")).intValue() == id).findFirst();
            if (current.isPresent()) {
                Map<String, Object> p = current.get();
                before = String.format("price=%s, stock=%s, categoryId=%s",
                    p.get("price"), p.get("quantity"), p.get("categoryId"));
            }
        } catch (Exception ignored) {}

        // 执行更新
        adminService.updateProduct(id, updates);

        // 构造 after 描述
        StringBuilder afterBuilder = new StringBuilder();
        if (updates.containsKey("price")) afterBuilder.append("price=").append(updates.get("price")).append(", ");
        if (updates.containsKey("quantity")) afterBuilder.append("stock=").append(updates.get("quantity")).append(", ");
        if (updates.containsKey("categoryId")) afterBuilder.append("categoryId=").append(updates.get("categoryId")).append(", ");
        String after = afterBuilder.toString();

        operationLogService.log(OP_ADMIN, ROLE_ADMIN,
                "PRODUCT_UPDATE",
                String.format("修改商品 #%d 信息", id),
                "PRODUCT", Long.valueOf(id),
                before.isEmpty() ? "—" : before,
                after.isEmpty() ? "—" : after.substring(0, after.length() - 2),
                ip);
        return Result.success(null);
    }

    @PostMapping("/categories")
    public Result<Void> addCategory(@RequestBody Map<String, String> body,
                                    HttpServletRequest request) {
        String ip = getClientIp(request);
        String name = body.get("name");
        adminService.addCategory(name);
        // 获取刚插入的分类ID（取最新）
        List<Map<String, Object>> cats = adminService.getAllCategories();
        Long catId = cats.stream()
                .filter(c -> name.equals(c.get("name")))
                .map(c -> ((Number) c.get("id")).longValue())
                .findFirst().orElse(null);
        operationLogService.log(OP_ADMIN, ROLE_ADMIN,
                "CATEGORY_ADD",
                String.format("新增分类「%s」", name),
                "CATEGORY", catId, ip);
        return Result.success(null);
    }

    @DeleteMapping("/categories/{id}")
    public Result<Void> deleteCategory(@PathVariable Integer id,
                                       HttpServletRequest request) {
        String ip = getClientIp(request);
        // 记录删除前名称
        List<Map<String, Object>> cats = adminService.getAllCategories();
        String catName = cats.stream()
                .filter(c -> ((Number) c.get("id")).intValue() == id)
                .map(c -> (String) c.get("name"))
                .findFirst().orElse("ID=" + id);

        adminService.deleteCategory(id);
        operationLogService.log(OP_ADMIN, ROLE_ADMIN,
                "CATEGORY_DELETE",
                String.format("删除分类「%s」（#%d）", catName, id),
                "CATEGORY", Long.valueOf(id),
                "name=" + catName, "deleted", ip);
        return Result.success(null);
    }

    // ==================== 操作日志 ====================

    @GetMapping("/operation-logs")
    public Result<List<Map<String, Object>>> getOperationLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String targetType) {
        List<Map<String, Object>> logs;
        if ((action == null || action.isEmpty()) && (targetType == null || targetType.isEmpty())) {
            logs = operationLogService.listAll();
        } else {
            logs = operationLogService.search(null, action, targetType);
        }
        return Result.success(logs);
    }

    // ==================== 内部工具（不记日志）====================

    @PostMapping("/refresh-ip-geo")
    public Result<Map<String, Object>> refreshIpGeo() {
        int count = 0;
        for (org.zyq.transaction.user.entity.User u : userRepository.findAll()) {
            String ip = u.getLastLoginIp();
            if (ip != null && !ip.isEmpty() && u.getLastLoginProvince() == null) {
                String location = ipGeoService.lookup(ip);
                if (location != null && !"未知".equals(location) && !"本地".equals(location)) {
                    int slash = location.indexOf('/');
                    if (slash > 0) {
                        u.setLastLoginProvince(location.substring(0, slash));
                        u.setLastLoginCity(location.substring(slash + 1));
                    } else {
                        u.setLastLoginProvince(location);
                    }
                    userRepository.save(u);
                    count++;
                } else if ("本地".equals(location)) {
                    u.setLastLoginProvince("本地");
                    u.setLastLoginCity(null);
                    userRepository.save(u);
                    count++;
                }
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("refreshed", count);
        result.put("total", (int) userRepository.count());
        return Result.success(result);
    }

    // 用户画像详情
    @GetMapping("/users/{id}/profile")
    public Result<UserProfileVO> getUserProfile(@PathVariable Long id) {
        return Result.success(adminService.getUserProfile(id));
    }

}
