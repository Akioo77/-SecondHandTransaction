package org.zyq.transaction.transaction.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.zyq.transaction.common.exception.ApiException;
import org.springframework.transaction.annotation.Transactional;
import org.zyq.transaction.transaction.entity.Category;
import org.zyq.transaction.transaction.vo.UserProfileVO;
import org.zyq.transaction.transaction.entity.Product;
import org.zyq.transaction.transaction.repository.OrderRepository;
import org.zyq.transaction.transaction.repository.ProductViewRepository;
import org.zyq.transaction.transaction.entity.ProductView;
import org.zyq.transaction.transaction.entity.Order;
import org.zyq.transaction.user.entity.User;
import org.zyq.transaction.user.repository.UserRepository;
import org.zyq.transaction.user.repository.FavoritesRepository;
import org.zyq.transaction.transaction.repository.CategoryRepository;
import org.zyq.transaction.transaction.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class AdminService {

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductViewRepository productViewRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private FavoritesRepository favoritesRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // ---- 仪表盘统计 ----
    public Map<String, Object> getStats() {
        Map<String, Object> m = new HashMap<>();
        m.put("totalUsers", querySingle("select count(u) from User u where u.deleted = false", Long.class));
        m.put("totalProducts", querySingle("select count(p) from Product p where p.isDeleted = 0 or p.isDeleted is null", Long.class));
        m.put("totalOrders", querySingle("select count(o) from Order o", Long.class));
        try {
            Object rev = em.createNativeQuery("select coalesce(sum(total_price), 0) from orders where status = 40").getSingleResult();
            m.put("totalRevenue", ((Number) rev).doubleValue());
        } catch (Exception e) {
            m.put("totalRevenue", 0.0);
        }
        m.put("pendingOrders", querySingle("select count(o) from Order o where o.status = 10", Long.class));
        m.put("topProducts", topProducts());
        return m;
    }

    // ---- 用户列表 ----
    public List<Map<String, Object>> getAllUsers() {
        String sql = """
            select u.id, u.username, u.created_at, u.is_deleted,
                   case when u.last_login_ip in ('0:0:0:0:0:0:0:1','::1') then '127.0.0.1'
                        when u.last_login_ip is null or u.last_login_ip = '' then '—'
                        else u.last_login_ip end as last_login_ip,
                   coalesce(u.last_login_province, '') as last_login_province,
                   coalesce(u.last_login_city, '') as last_login_city
            from users u order by u.created_at desc
            """;
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql).getResultList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", ((Number) r[0]).intValue());
            m.put("username", r[1]);
            m.put("createdAt", r[2]);
            m.put("enabled", r[3] != null && !((Boolean) r[3]));
            m.put("lastLoginIp", r[4] != null ? r[4] : "—");
            m.put("lastLoginProvince", r[5] != null && !((String) r[5]).isEmpty() ? r[5] : null);
            m.put("lastLoginCity", r[6] != null && !((String) r[6]).isEmpty() ? r[6] : null);
            // 查用户订单数和商品数（参数化查询，防止 SQL 注入）
            int uid = ((Number) r[0]).intValue();
            m.put("orderCount", ((Number) querySingleWithParam(
                "select count(o) from Order o where o.buyerId = ?1 or o.sellerId = ?1", uid, Long.class)).intValue());
            m.put("productCount", ((Number) querySingleWithParam(
                "select count(p) from Product p where p.sellerId = ?1 and (p.isDeleted = 0 or p.isDeleted is null)", uid, Long.class)).intValue());
            result.add(m);
        }
        return result;
    }

    @Transactional
    public void updateUserStatus(Integer id, Boolean enabled) {
        User u = userRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        u.setDeleted(!enabled);
        userRepository.save(u);
    }

    @Transactional
    public void updateUserPassword(Integer id, String newPassword) {
        User u = userRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        u.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(u);
    }

    // ---- 商品列表 ----
    public List<Map<String, Object>> getAllProducts() {
        String sql = """
            select p.id, p.title, p.price, p.quantity, p.images, p.created_at,
                   c.name as category_name, s.username as seller_name, p.is_deleted
            from products p
            left join categories c on c.id = p.category_id
            left join users s on s.id = p.seller_id
            order by p.created_at desc
            """;
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql).getResultList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", ((Number) r[0]).intValue());
            m.put("title", r[1]);
            m.put("price", r[2]);
            m.put("quantity", r[3]);
            m.put("images", r[4]);
            m.put("createdAt", r[5]);
            m.put("categoryName", r[6]);
            m.put("sellerName", r[7]);
            m.put("isDeleted", r[8]);
            result.add(m);
        }
        return result;
    }

    @Transactional
    public void updateProduct(Integer id, Map<String, Object> updates) {
        Product p = productRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new RuntimeException("商品不存在: " + id));
        if (updates.containsKey("price"))
            p.setPrice(new BigDecimal(updates.get("price").toString()));
        if (updates.containsKey("quantity"))
            p.setQuantity(Integer.parseInt(updates.get("quantity").toString()));
        if (updates.containsKey("categoryId"))
            p.setCategoryId(Long.parseLong(updates.get("categoryId").toString()));
        productRepository.save(p);
    }

    // ---- 类别列表 ----
    public List<Map<String, Object>> getAllCategories() {
        String sql = """
            select c.id, c.name,
                   (select count(p.id) from products p where p.category_id = c.id and (p.is_deleted = 0 or p.is_deleted is null)) as product_count
            from categories c
            """;
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql).getResultList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", ((Number) r[0]).intValue());
            m.put("name", r[1]);
            m.put("productCount", ((Number) r[2]).intValue());
            result.add(m);
        }
        return result;
    }

    @Transactional
    public void addCategory(String name) {
        Category c = new Category();
        c.setName(name);
        categoryRepository.save(c);
    }

    @Transactional
    public void deleteCategory(Integer id) {
        categoryRepository.deleteById(Long.valueOf(id));
    }

    // ---- 订单列表 ----
    public List<Map<String, Object>> getAllOrders() {
        String sql = """
            select o.id, o.order_no, o.status, o.quantity, o.total_price, o.created_at,
                   o.receiver_name, o.receiver_phone, o.receiver_address,
                   buyer.username as buyer_name, seller.username as seller_name, p.title as product_title
            from orders o
            left join users buyer on buyer.id = o.buyer_id
            left join users seller on seller.id = o.seller_id
            left join products p on p.id = o.product_id
            order by o.created_at desc
            limit 100
            """;
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql).getResultList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", ((Number) r[0]).intValue());
            m.put("orderNo", r[1]);
            m.put("status", r[2]);
            m.put("quantity", r[3]);
            m.put("totalPrice", r[4]);
            m.put("createdAt", r[5]);
            m.put("receiverName", r[6]);
            m.put("receiverPhone", r[7]);
            m.put("receiverAddress", r[8]);
            m.put("buyerName", r[9]);
            m.put("sellerName", r[10]);
            m.put("productTitle", r[11]);
            result.add(m);
        }
        return result;
    }

    // ---- 销售趋势 ----
    public Map<String, Object> getSalesTrend() {
        // H2 兼容写法（DATEADD 用于日期减法，DATEDIFF 用于计算天数）
        String sql = """
            select cast(created_at as date) as date_str,
                   count(*) as order_count,
                   coalesce(sum(total_price), 0) as revenue
            from orders
            where created_at >= CURRENT_DATE - 30
            group by cast(created_at as date)
            order by date_str asc
            """;
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql).getResultList();
        List<Map<String, Object>> daily = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("date", r[0]);
            m.put("orderCount", ((Number) r[1]).intValue());
            m.put("revenue", ((Number) r[2]).doubleValue());
            daily.add(m);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("daily", daily);
        return result;
    }

    // ---- 内部工具 ----
    private <T> T querySingle(String jpql, Class<T> type) {
        try {
            return em.createQuery(jpql, type).getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    // 参数化查询（防 SQL 注入）
    private <T> T querySingleWithParam(String jpql, Object param, Class<T> type) {
        try {
            return em.createQuery(jpql, type)
                    .setParameter(1, param)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    private List<Map<String, Object>> topProducts() {
        String sql = """
            select p.id, p.title, p.price, p.quantity,
                   coalesce(sum(o.quantity), 0) as sold,
                   coalesce(sum(o.total_price), 0) as revenue
            from products p
            left join orders o on o.product_id = p.id and o.status = 40
            where p.is_deleted = 0 or p.is_deleted is null
            group by p.id, p.title, p.price, p.quantity
            order by sold desc limit 10
            """;
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql).getResultList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", ((Number) r[0]).intValue());
            m.put("title", r[1]);
            m.put("price", r[2]);
            m.put("quantity", r[3]);
            m.put("sold", ((Number) r[4]).intValue());
            m.put("revenue", ((Number) r[5]).doubleValue());
            result.add(m);
        }
        return result;
    }

    // ==================== 用户画像详情 ====================
    public UserProfileVO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 1. 地域信息
        String region = "未知";
        if (user.getLastLoginProvince() != null && !user.getLastLoginProvince().isEmpty()) {
            region = user.getLastLoginCity() != null && !user.getLastLoginCity().isEmpty()
                ? user.getLastLoginProvince() + "/" + user.getLastLoginCity()
                : user.getLastLoginProvince();
        }

        // 2. 购买力分析
        List<Order> userOrders = orderRepository.search(userId, null, null);
        List<Order> completed = userOrders.stream()
                .filter(o -> o.getStatus() != null && o.getStatus() == 40).toList();

        BigDecimal totalSpend = completed.stream()
                .map(o -> o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long completedCount = completed.size();
        BigDecimal avgOrderAmount = completedCount > 0
                ? totalSpend.divide(BigDecimal.valueOf(completedCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String powerLevel = totalSpend.doubleValue() > 1000 ? "高"
                : totalSpend.doubleValue() > 200 ? "中" : "低";

        UserProfileVO.PurchasePower purchasePower = new UserProfileVO.PurchasePower(
                totalSpend, userOrders.size(), completedCount, avgOrderAmount, powerLevel);

        // 3. 品类偏好（浏览 + 购买）
        List<ProductView> userViews = productViewRepository.findAll().stream()
                .filter(v -> userId.equals(v.getUserId())).toList();
        List<Product> allProducts = productRepository.findAll();

        // 按品类聚合浏览次数和购买次数
        Map<Long, long[]> catStats = new HashMap<>(); // catId -> [viewCount, buyCount, spend]
        for (ProductView v : userViews) {
            Product p = findProductById(allProducts, v.getProductId());
            if (p == null) continue;
            long[] stats = catStats.computeIfAbsent(p.getCategoryId(), k -> new long[3]);
            stats[0]++; // 浏览次数
        }
        for (Order o : completed) {
            Product p = findProductById(allProducts, o.getProductId());
            if (p == null) continue;
            long[] stats = catStats.computeIfAbsent(p.getCategoryId(), k -> new long[3]);
            stats[1]++; // 购买次数
            if (o.getTotalPrice() != null) {
                stats[2] += o.getTotalPrice().doubleValue(); // 品类消费
            }
        }

        // 找出最大浏览量和购买量用于归一化
        long maxViews = catStats.values().stream().mapToLong(s -> s[0]).max().orElse(1);
        long maxBuys = catStats.values().stream().mapToLong(s -> s[1]).max().orElse(1);

        List<UserProfileVO.CategoryPreference> prefs = new ArrayList<>();
        for (Map.Entry<Long, long[]> e : catStats.entrySet()) {
            Category cat = categoryRepository.findById(e.getKey()).orElse(null);
            if (cat == null) continue;
            String prefLevel;
            if (e.getValue()[1] >= 2 || (e.getValue()[0] > maxViews * 0.5 && e.getValue()[1] >= 1)) {
                prefLevel = "高";
            } else if (e.getValue()[1] >= 1 || e.getValue()[0] > maxViews * 0.2) {
                prefLevel = "中";
            } else {
                prefLevel = "低";
            }
            prefs.add(new UserProfileVO.CategoryPreference(
                    cat.getName(),
                    e.getKey(),
                    e.getValue()[0],
                    e.getValue()[1],
                    BigDecimal.valueOf(e.getValue()[2]).setScale(2, RoundingMode.HALF_UP),
                    prefLevel
            ));
        }
        // 按偏好程度降序
        prefs.sort((a, b) -> {
            String order = "高低低";
            return order.indexOf(b.preferenceLevel()) - order.indexOf(a.preferenceLevel());
        });

        // 4. 行为统计
        List<Product> userProducts = allProducts.stream()
                .filter(p -> userId.equals(p.getSellerId())).toList();
        long userBuyCount = completed.size();
        long userSellCount = completed.stream()
                .filter(o -> userId.equals(o.getSellerId())).count();

        // 活跃天数
        long activeDays = userViews.stream()
                .filter(v -> v.getViewedAt() != null)
                .map(v -> v.getViewedAt().toLocalDate())
                .distinct()
                .count();

        long favoriteCount = favoritesRepository.findById_UserId(userId).size();

        UserProfileVO.BehaviorStats stats = new UserProfileVO.BehaviorStats(
                userViews.size(),
                favoriteCount,
                userProducts.size(),
                userBuyCount,
                userSellCount,
                activeDays
        );

        return new UserProfileVO(
                userId,
                user.getUsername(),
                region,
                user.getLastLoginIp() != null ? user.getLastLoginIp() : "—",
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : "—",
                purchasePower,
                prefs,
                stats
        );
    }

    private Product findProductById(List<Product> products, Long id) {
        return products.stream().filter(p -> id.equals(p.getId())).findFirst().orElse(null);
    }

    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Not Found", "Order not found"));
        if (order.getStatus() != 10) {
            throw new ApiException(409, "Conflict", "Only placed orders can be cancelled");
        }
        order.setStatus(50);
        orderRepository.save(order);
        // 归还库存
        Product product = productRepository.findById(order.getProductId()).orElse(null);
        if (product != null) {
            product.setQuantity(product.getQuantity() + order.getQuantity());
            product.setIsDeleted(0);
            productRepository.save(product);
        }
    }

}