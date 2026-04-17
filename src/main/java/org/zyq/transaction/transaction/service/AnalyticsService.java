package org.zyq.transaction.transaction.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.zyq.transaction.transaction.entity.Order;
import org.zyq.transaction.transaction.entity.Product;
import org.zyq.transaction.transaction.entity.ProductStats;
import org.zyq.transaction.transaction.entity.ProductView;
import org.zyq.transaction.transaction.repository.*;
import org.zyq.transaction.user.entity.UserAddress;
import org.zyq.transaction.user.repository.UserAddressRepository;
import org.zyq.transaction.user.repository.FavoritesRepository;
import org.zyq.transaction.transaction.vo.UserPortraitVO;
import org.zyq.transaction.transaction.vo.RankingItemVO;
import org.zyq.transaction.transaction.vo.DailyTrendVO;
import org.zyq.transaction.transaction.vo.MonthlyTrendVO;
import org.zyq.transaction.transaction.vo.CategoryAnalysisVO;
import org.zyq.transaction.transaction.vo.RecommendedProductVO;
import org.zyq.transaction.transaction.vo.TrendAnalysisVO;
import org.zyq.transaction.transaction.vo.AnomalyDetectionVO;
import org.zyq.transaction.transaction.vo.SupplyDemandVO;
import org.zyq.transaction.transaction.vo.SalesForecastVO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ProductStatsRepository productStatsRepository;
    @Autowired private ProductViewRepository productViewRepository;
    @Autowired private UserAddressRepository userAddressRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private FavoritesRepository favoritesRepository;

    // ==================== 用户画像 ====================
    public UserPortraitVO getUserPortrait() {
        // 地域分布
        List<Object> regionRaw = userAddressRepository.countByProvince();
        Map<String, Long> regionDist = new LinkedHashMap<>();
        for (Object obj : regionRaw) {
            Object[] row = (Object[]) obj;
            String province = String.valueOf(row[0]);
            Long count = (Long) row[1];
            regionDist.put(province, count);
        }

        // 购买力分段（按用户累计消费金额分）
        Map<String, Long> purchasePower = new LinkedHashMap<>();
        purchasePower.put("0-100元", 0L);
        purchasePower.put("100-500元", 0L);
        purchasePower.put("500-1000元", 0L);
        purchasePower.put("1000元以上", 0L);

        List<Order> allOrders = orderRepository.search(null, null, 40);
        Map<Long, BigDecimal> userSpend = new HashMap<>();
        for (Order o : allOrders) {
            if (o.getTotalPrice() == null) continue;
            userSpend.merge(o.getBuyerId(), o.getTotalPrice(), BigDecimal::add);
        }
        for (BigDecimal amount : userSpend.values()) {
            if (amount.compareTo(new BigDecimal("100")) < 0) {
                purchasePower.merge("0-100元", 1L, Long::sum);
            } else if (amount.compareTo(new BigDecimal("500")) < 0) {
                purchasePower.merge("100-500元", 1L, Long::sum);
            } else if (amount.compareTo(new BigDecimal("1000")) < 0) {
                purchasePower.merge("500-1000元", 1L, Long::sum);
            } else {
                purchasePower.merge("1000元以上", 1L, Long::sum);
            }
        }

        // 品类偏好
        Map<String, Long> categoryPref = new LinkedHashMap<>();
        for (var cat : categoryRepository.findAll()) {
            categoryPref.put(cat.getName(), 0L);
        }
        for (Order o : allOrders) {
            Product p = productRepository.findActiveById(o.getProductId()).orElse(null);
            if (p == null) continue;
            var cat = categoryRepository.findById(p.getCategoryId()).orElse(null);
            if (cat != null) {
                categoryPref.merge(cat.getName(), (long) o.getQuantity(), Long::sum);
            }
        }

        return new UserPortraitVO(
            userSpend.size(),
            userSpend.size(),
            regionDist,
            purchasePower,
            categoryPref
        );
    }

    // ==================== 销售排行榜 ====================
    public List<RankingItemVO> getSalesRanking(int limit) {
        List<ProductStats> statsList = productStatsRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(ProductStats::getOrderCount).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        List<RankingItemVO> result = new ArrayList<>();
        for (ProductStats ps : statsList) {
            Product p = productRepository.findActiveById(ps.getProductId()).orElse(null);
            if (p == null) continue;
            String catName = categoryRepository.findById(p.getCategoryId())
                    .map(c -> c.getName()).orElse("");
            result.add(new RankingItemVO(
                    ps.getProductId(), p.getTitle(), p.getCategoryId(), catName,
                    p.getPrice(), ps.getOrderCount(), ps.getOrderAmount(),
                    ps.getViewCount(), ps.getFavoriteCount()
            ));
        }
        return result;
    }

    // ==================== 销售趋势（日）====================
    public List<DailyTrendVO> getDailyTrend(int days) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(days);

        List<Object> raw = productViewRepository.dailyViewTrend(start, end);
        Map<String, Long> viewMap = new HashMap<>();
        for (Object obj : raw) {
            Object[] row = (Object[]) obj;
            viewMap.put(row[0].toString(), (Long) row[1]);
        }

        List<Order> orders = orderRepository.search(null, null, 40);
        Map<String, Map<String, Object>> dailyMap = new LinkedHashMap<>();
        for (int i = 0; i <= days; i++) {
            String day = start.plusDays(i).toLocalDate().toString();
            dailyMap.put(day, new HashMap<>() {{
                put("orderCount", 0L);
                put("soldQuantity", 0L);
                put("salesAmount", BigDecimal.ZERO);
                put("viewCount", viewMap.getOrDefault(day, 0L));
            }});
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (Order o : orders) {
            if (o.getCreatedAt() == null) continue;
            String day = o.getCreatedAt().toLocalDate().format(fmt);
            if (!dailyMap.containsKey(day)) continue;
            Map<String, Object> m = dailyMap.get(day);
            m.put("orderCount", (Long) m.get("orderCount") + 1);
            Integer qty = o.getQuantity();
            m.put("soldQuantity", (Long) m.get("soldQuantity") + (qty == null ? 0 : qty));
            m.put("salesAmount", ((BigDecimal) m.get("salesAmount")).add(o.getTotalPrice()));
        }

        return dailyMap.entrySet().stream().map(e -> new DailyTrendVO(
                e.getKey(),
                (Long) e.getValue().get("orderCount"),
                (Long) e.getValue().get("soldQuantity"),
                (BigDecimal) e.getValue().get("salesAmount"),
                (Long) e.getValue().get("viewCount")
        )).collect(Collectors.toList());
    }

    // ==================== 销售趋势（月）====================
    public List<MonthlyTrendVO> getMonthlyTrend(int months) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusMonths(months);
        List<Order> orders = orderRepository.search(null, null, 40);

        Map<YearMonth, Map<String, Object>> monthlyMap = new LinkedHashMap<>();
        for (int i = months; i >= 0; i--) {
            YearMonth ym = YearMonth.from(end.minusMonths(i));
            monthlyMap.put(ym, new HashMap<>() {{
                put("orderCount", 0L);
                put("soldQuantity", 0L);
                put("salesAmount", BigDecimal.ZERO);
            }});
        }

        for (Order o : orders) {
            if (o.getCreatedAt() == null) continue;
            YearMonth ym = YearMonth.from(o.getCreatedAt());
            if (!monthlyMap.containsKey(ym)) continue;
            Map<String, Object> m = monthlyMap.get(ym);
            m.put("orderCount", (Long) m.get("orderCount") + 1);
            Integer qty = o.getQuantity();
            m.put("soldQuantity", (Long) m.get("soldQuantity") + (qty == null ? 0 : qty));
            m.put("salesAmount", ((BigDecimal) m.get("salesAmount")).add(o.getTotalPrice()));
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        return monthlyMap.entrySet().stream().map(e -> new MonthlyTrendVO(
                e.getKey().format(fmt),
                (Long) e.getValue().get("orderCount"),
                (Long) e.getValue().get("soldQuantity"),
                (BigDecimal) e.getValue().get("salesAmount")
        )).collect(Collectors.toList());
    }

    // ==================== 趋势研判分析 ====================
    // 对比近N天与上一个周期的数据，给出涨跌判断
    public TrendAnalysisVO getTrendAnalysis(int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart = now.minusDays(days);
        LocalDateTime previousStart = now.minusDays(days * 2);
        LocalDateTime previousEnd = currentStart;

        List<Order> currentOrders = orderRepository.search(null, null, 40).stream()
                .filter(o -> o.getCreatedAt() != null
                        && o.getCreatedAt().isAfter(currentStart)
                        && !o.getCreatedAt().isAfter(now))
                .toList();

        List<Order> previousOrders = orderRepository.search(null, null, 40).stream()
                .filter(o -> o.getCreatedAt() != null
                        && o.getCreatedAt().isAfter(previousStart)
                        && o.getCreatedAt().isBefore(previousEnd))
                .toList();

        BigDecimal currentSales = currentOrders.stream()
                .map(Order::getTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal previousSales = previousOrders.stream()
                .map(Order::getTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long currentQty = currentOrders.stream().mapToInt(o -> o.getQuantity() == null ? 0 : o.getQuantity()).sum();
        long previousQty = previousOrders.stream().mapToInt(o -> o.getQuantity() == null ? 0 : o.getQuantity()).sum();

        BigDecimal salesChange = previousSales.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : currentSales.subtract(previousSales)
                        .divide(previousSales, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));

        BigDecimal qtyChange = previousQty == 0
                ? BigDecimal.ZERO
                : new BigDecimal(currentQty - previousQty)
                        .divide(new BigDecimal(previousQty), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));

        String trend = salesChange.compareTo(BigDecimal.ZERO) > 0 ? "上涨"
                : salesChange.compareTo(BigDecimal.ZERO) < 0 ? "下跌" : "持平";

        String advice = trend.equals("上涨")
                ? "业务增长良好，可加大库存准备"
                : trend.equals("下跌")
                ? "销量下滑，建议促销或优化商品展示"
                : "销量稳定，维持当前运营策略";

        return new TrendAnalysisVO(
                currentSales, previousSales, salesChange,
                currentQty, previousQty, qtyChange,
                trend, advice
        );
    }

    // ==================== 品类供需分析 ====================
    public List<CategoryAnalysisVO> getCategoryAnalysis() {
        List<Product> allProducts = productRepository.findAll();
        List<Order> completedOrders = orderRepository.search(null, null, 40);

        Map<Long, Long> soldQtyByCat = new HashMap<>();
        Map<Long, BigDecimal> salesAmtByCat = new HashMap<>();

        for (Order o : completedOrders) {
            Integer qty = o.getQuantity();
            if (qty == null) continue;
            for (Product p : allProducts) {
                if (p.getId() == o.getProductId()) {
                    soldQtyByCat.merge(p.getCategoryId(), (long) qty, Long::sum);
                    salesAmtByCat.merge(p.getCategoryId(), o.getTotalPrice(), BigDecimal::add);
                    break;
                }
            }
        }

        Map<Long, Long> prodCountByCat = allProducts.stream()
                .collect(Collectors.groupingBy(Product::getCategoryId, Collectors.counting()));

        List<CategoryAnalysisVO> result = new ArrayList<>();
        for (var cat : categoryRepository.findAll()) {
            Long prodCount = prodCountByCat.getOrDefault(cat.getId(), 0L);
            Long soldQty = soldQtyByCat.getOrDefault(cat.getId(), 0L);
            BigDecimal salesAmt = salesAmtByCat.getOrDefault(cat.getId(), BigDecimal.ZERO);
            BigDecimal avgPrice = prodCount > 0
                    ? salesAmt.divide(BigDecimal.valueOf(prodCount), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            result.add(new CategoryAnalysisVO(
                    cat.getId(), cat.getName(), prodCount, soldQty, salesAmt, avgPrice
            ));
        }
        result.sort(Comparator.comparing(CategoryAnalysisVO::totalSalesAmount).reversed());
        return result;
    }

    // ==================== 供需监控（预警）====================
    // 供给 = 上架商品数 * 库存总量；需求 = 已售 + 当前浏览量（作为需求代理指标）
    public List<SupplyDemandVO> getSupplyDemand() {
        List<Product> allProducts = productRepository.findAll();
        List<Order> completedOrders = orderRepository.search(null, null, 40);

        Map<Long, Long> soldByCat = new HashMap<>();
        for (Order o : completedOrders) {
            Integer qty = o.getQuantity();
            if (qty == null) continue;
            for (Product p : allProducts) {
                if (p.getId() == o.getProductId()) {
                    soldByCat.merge(p.getCategoryId(), (long) qty, Long::sum);
                    break;
                }
            }
        }

        // 供给 = 各品类在售商品数量
        Map<Long, Long> supplyByCat = allProducts.stream()
                .collect(Collectors.groupingBy(Product::getCategoryId, Collectors.counting()));

        List<SupplyDemandVO> result = new ArrayList<>();
        for (var cat : categoryRepository.findAll()) {
            long supply = supplyByCat.getOrDefault(cat.getId(), 0L);
            long demand = soldByCat.getOrDefault(cat.getId(), 0L);
            String status;
            if (supply == 0 && demand == 0) {
                status = "暂无数据";
            } else if (demand == 0 || supply > demand * 3) {
                status = "⚠️ 供给过剩";
            } else if (supply < demand && demand > 0) {
                status = "🔥 需求旺盛";
            } else {
                status = "✅ 供需平衡";
            }
            result.add(new SupplyDemandVO(
                    cat.getId(), cat.getName(),
                    supply, demand, status
            ));
        }
        return result;
    }

    // ==================== 看了又买（协同过滤推荐）====================
    // 新算法：时长加权 × 时间衰减
    public List<RecommendedProductVO> getAlsoBought(Long productId, Long viewerId, int limit) {
        if (productId == null) return Collections.emptyList();

        List<Order> allCompleted = orderRepository.search(null, null, 40);
        List<ProductView> sourceViews = productViewRepository.findAll().stream()
                .filter(v -> productId.equals(v.getProductId()))
                .toList();

        // STEP 1：计算每个看过源商品的用户权重（基于停留时长）
        // 权重规则：无时长( bounce)=0.3 | <5s=0.5 | 5-30s=1.0 | 30-120s=1.5 | >120s=2.0
        Map<Long, Double> userWeightMap = new HashMap<>();
        for (ProductView v : sourceViews) {
            if (v.getUserId() == null) continue;
            double w = calcDurationWeight(v.getDurationSeconds());
            userWeightMap.merge(v.getUserId(), w, Math::max); // 同一用户取最高权重
        }

        if (userWeightMap.isEmpty()) {
            // 没有人有浏览记录（无时长数据），退化为普通协同过滤
            return getAlsoBoughtFallback(productId, viewerId, limit, allCompleted);
        }

        // STEP 2：收集这些用户购买的其他商品，加权计分
        LocalDateTime now = LocalDateTime.now();
        Map<Long, Double> weightedScore = new HashMap<>();
        for (Order o : allCompleted) {
            if (!userWeightMap.containsKey(o.getBuyerId())) continue;
            if (o.getProductId().equals(productId)) continue; // 排除源商品

            double userW = userWeightMap.get(o.getBuyerId());
            double timeDecay = calcTimeDecay(o.getCreatedAt(), now);
            double score = userW * timeDecay;
            weightedScore.merge(o.getProductId(), score, Double::sum);
        }

        // STEP 3：排除当前用户已购买过的商品
        if (viewerId != null) {
            Set<Long> viewerBought = allCompleted.stream()
                    .filter(o -> viewerId.equals(o.getBuyerId()))
                    .map(Order::getProductId)
                    .collect(Collectors.toSet());
            viewerBought.forEach(weightedScore::remove);
        }

        // 按加权分数降序取 TOP N
        List<Long> topIds = weightedScore.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .toList();

        if (topIds.isEmpty()) {
            return getPopularRecommendations(limit);
        }

        List<RecommendedProductVO> result = new ArrayList<>();
        for (Long pid : topIds) {
            Product p = productRepository.findActiveById(pid).orElse(null);
            if (p == null) continue;
            ProductStats ps = productStatsRepository.findById(pid).orElse(null);
            result.add(new RecommendedProductVO(
                    p.getId(), p.getTitle(), p.getPrice(),
                    ps == null ? 0L : ps.getOrderCount(),
                    ps == null ? 0L : ps.getViewCount(),
                    "看了又买"
            ));
        }
        return result;
    }

    /** 纯协同过滤版本（无时长数据时降级使用） */
    private List<RecommendedProductVO> getAlsoBoughtFallback(Long productId, Long viewerId,
            int limit, List<Order> allCompleted) {
        Set<Long> buyerUsers = allCompleted.stream()
                .filter(o -> productId.equals(o.getProductId()))
                .map(Order::getBuyerId)
                .collect(Collectors.toSet());

        if (buyerUsers.isEmpty()) return getPopularRecommendations(limit);

        Map<Long, Long> coPurchaseCount = new HashMap<>();
        for (Order o : allCompleted) {
            if (buyerUsers.contains(o.getBuyerId()) && !o.getProductId().equals(productId)) {
                coPurchaseCount.merge(o.getProductId(), 1L, Long::sum);
            }
        }

        if (viewerId != null) {
            Set<Long> viewerBought = allCompleted.stream()
                    .filter(o -> viewerId.equals(o.getBuyerId()))
                    .map(Order::getProductId)
                    .collect(Collectors.toSet());
            viewerBought.forEach(coPurchaseCount::remove);
        }

        List<Long> topIds = coPurchaseCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .toList();

        if (topIds.isEmpty()) return getPopularRecommendations(limit);

        List<RecommendedProductVO> result = new ArrayList<>();
        for (Long pid : topIds) {
            Product p = productRepository.findActiveById(pid).orElse(null);
            if (p == null) continue;
            ProductStats ps = productStatsRepository.findById(pid).orElse(null);
            result.add(new RecommendedProductVO(
                    p.getId(), p.getTitle(), p.getPrice(),
                    ps == null ? 0L : ps.getOrderCount(),
                    ps == null ? 0L : ps.getViewCount(),
                    "看了又买"
            ));
        }
        return result;
    }

    /** 根据停留时长计算用户权重 */
    private double calcDurationWeight(Integer durationSec) {
        if (durationSec == null || durationSec <= 0) return 0.3;  // bounce
        if (durationSec < 5)   return 0.5;
        if (durationSec < 30)  return 1.0;
        if (durationSec < 120) return 1.5;
        return 2.0;  // 深度浏览
    }

    /** 时间衰减因子：7天内2x，30天内1.5x，更久1x */
    private double calcTimeDecay(LocalDateTime orderTime, LocalDateTime now) {
        if (orderTime == null) return 1.0;
        long days = java.time.temporal.ChronoUnit.DAYS.between(orderTime.toLocalDate(), now.toLocalDate());
        if (days <= 7)  return 2.0;
        if (days <= 30) return 1.5;
        return 1.0;
    }

    // ==================== 热销推荐（首页用）====================
    public List<RecommendedProductVO> getPopularRecommendations(int limit) {
        return productStatsRepository.findAll().stream()
                .sorted(Comparator.comparing(ProductStats::getOrderCount).reversed()
                        .thenComparing(ProductStats::getViewCount).reversed())
                .limit(limit)
                .map(ps -> {
                    Product p = productRepository.findActiveById(ps.getProductId()).orElse(null);
                    if (p == null) return null;
                    return new RecommendedProductVO(
                            p.getId(), p.getTitle(), p.getPrice(),
                            ps.getOrderCount(), ps.getViewCount(),
                            ps.getViewCount() > 50 ? "热门商品" : "为你推荐"
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ==================== 个性化首页推荐（基于品类偏好 + 热销混合）====================
    // 综合：用户品类偏好 × 全局热销 × 买了又买
    public List<RecommendedProductVO> getPersonalizedRecommendations(Long userId, int limit) {
        List<RecommendedProductVO> result = new ArrayList<>();

        // 已购买过的商品（排除用）
        Set<Long> boughtProductIds = new HashSet<>();
        Set<Long> boughtCategoryIds = new HashSet<>();
        if (userId != null) {
            List<Order> completed = orderRepository.search(null, null, 40).stream()
                    .filter(o -> userId.equals(o.getBuyerId())).toList();
            for (Order o : completed) {
                boughtProductIds.add(o.getProductId());
                productRepository.findActiveById(o.getProductId())
                        .ifPresent(p -> boughtCategoryIds.add(p.getCategoryId()));
            }
        }

        // 品类偏好数据（在 STEP1 内填充，STEP2 需要引用）
        Map<Long, Long> categoryViewSeconds = new HashMap<>();

        // STEP 1：用户品类偏好推荐（浏览时长加权 × 该品类下的热销）
        if (userId != null) {
            List<ProductView> userViews = productViewRepository.findAll().stream()
                    .filter(v -> userId.equals(v.getUserId()))
                    .toList();

            // 按品类聚合浏览时长
            for (ProductView v : userViews) {
                Product p = productRepository.findActiveById(v.getProductId()).orElse(null);
                if (p == null) continue;
                int sec = v.getDurationSeconds() != null ? v.getDurationSeconds() : 0;
                // 深度浏览（>30s）权重翻倍
                int weight = (sec > 30) ? 2 : 1;
                categoryViewSeconds.merge(p.getCategoryId(), (long) sec * weight, Long::sum);
            }

            if (!categoryViewSeconds.isEmpty()) {
                // 找出用户最感兴趣的品类
                Long topCatId = Collections.max(categoryViewSeconds.entrySet(), Map.Entry.comparingByValue()).getKey();

                // 该品类下浏览深度最深（高时长）的商品优先
                List<ProductView> deepViews = userViews.stream()
                        .filter(v -> {
                            Product p = productRepository.findActiveById(v.getProductId()).orElse(null);
                            return p != null && topCatId.equals(p.getCategoryId())
                                    && v.getDurationSeconds() != null && v.getDurationSeconds() > 10;
                        })
                        .sorted(Comparator.comparing(ProductView::getDurationSeconds).reversed())
                        .limit(limit / 2)
                        .toList();

                for (ProductView v : deepViews) {
                    if (boughtProductIds.contains(v.getProductId())) continue;
                    Product p = productRepository.findActiveById(v.getProductId()).orElse(null);
                    if (p == null) continue;
                    ProductStats ps = productStatsRepository.findById(p.getId()).orElse(null);
                    result.add(new RecommendedProductVO(
                            p.getId(), p.getTitle(), p.getPrice(),
                            ps == null ? 0L : ps.getOrderCount(),
                            ps == null ? 0L : ps.getViewCount(),
                            "猜你喜欢"
                    ));
                    boughtProductIds.add(p.getId());
                }
            }
        }

        // STEP 2：补充全局热销（排除已推荐和已购买）
        List<ProductStats> popular = productStatsRepository.findAll().stream()
                .sorted(Comparator.comparing(ProductStats::getOrderCount).reversed()
                        .thenComparing(ProductStats::getViewCount).reversed())
                .limit(limit)
                .toList();

        for (ProductStats ps : popular) {
            if (boughtProductIds.contains(ps.getProductId())) continue;
            Product p = productRepository.findActiveById(ps.getProductId()).orElse(null);
            if (p == null) continue;
            // 如果用户有品类偏好但这个商品不在偏好品类里，降权为"热门推荐"标签
            String reason = (userId != null && !categoryViewSeconds.isEmpty()
                    && categoryViewSeconds.containsKey(p.getCategoryId())) ? "为你推荐" : "热门商品";
            result.add(new RecommendedProductVO(
                    p.getId(), p.getTitle(), p.getPrice(),
                    ps.getOrderCount(), ps.getViewCount(), reason
            ));
            if (result.size() >= limit) break;
        }

        result.sort(Comparator.comparing(
                (RecommendedProductVO r) -> "猜你喜欢".equals(r.reason()) ? 0 :
                        "为你推荐".equals(r.reason()) ? 1 : 2
        ).thenComparing(r -> -r.viewCount()));
        return result.stream().limit(limit).toList();
    }

    // ==================== 商品浏览趋势（单品分析）====================
    public Map<String, Object> getProductTrend(Long productId, int days) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(days);
        List<ProductView> views = productViewRepository.findAll().stream()
                .filter(v -> v.getProductId().equals(productId))
                .filter(v -> v.getViewedAt() != null
                        && v.getViewedAt().isAfter(start)
                        && !v.getViewedAt().isAfter(end))
                .toList();

        Map<String, Long> dailyViews = new LinkedHashMap<>();
        for (int i = 0; i <= days; i++) {
            String day = start.plusDays(i).toLocalDate().toString();
            dailyViews.put(day, 0L);
        }
        for (ProductView v : views) {
            String day = v.getViewedAt().toLocalDate().toString();
            if (dailyViews.containsKey(day)) {
                dailyViews.put(day, dailyViews.get(day) + 1);
            }
        }

        long totalViews = views.size();
        long uniqueUsers = views.stream().map(ProductView::getUserId).filter(Objects::nonNull).collect(Collectors.toSet()).size();
        String peakDay = Collections.max(dailyViews.entrySet(), Map.Entry.comparingByValue()).getKey();

        Map<String, Object> result = new HashMap<>();
        result.put("dailyViews", dailyViews);
        result.put("totalViews", totalViews);
        result.put("uniqueUsers", uniqueUsers);
        result.put("peakDay", peakDay);
        return result;
    }

    // ==================== 销售异常判别与实时监控 ====================
    // 检测三类异常：订单量突增、刷单（IP/用户高频下单）、价格异常
    public List<AnomalyDetectionVO> detectAnomalies() {
        List<AnomalyDetectionVO> anomalies = new ArrayList<>();
        List<Order> allOrders = orderRepository.search(null, null, null); // 查全部状态订单
        LocalDateTime now = LocalDateTime.now();

        // 1. 订单量突增检测（对比近30天历史均值）
        anomalies.addAll(detectOrderSpikes(allOrders, now));

        // 2. 刷单检测（同一IP或同一用户高频下单）
        anomalies.addAll(detectBrushOrders(allOrders, now));

        // 3. 价格异常检测（单价远低于同类均值）
        anomalies.addAll(detectPriceAnomalies());

        return anomalies;
    }

    // 日订单量突增：超过历史均值+2倍标准差为WARNING，超过+3倍为DANGER
    private List<AnomalyDetectionVO> detectOrderSpikes(List<Order> allOrders, LocalDateTime now) {
        List<AnomalyDetectionVO> result = new ArrayList<>();

        // 计算近30天每日订单数
        Map<String, Long> dailyCounts = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            String day = now.minusDays(i).toLocalDate().toString();
            dailyCounts.put(day, 0L);
        }
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (Order o : allOrders) {
            if (o.getCreatedAt() == null) continue;
            String day = o.getCreatedAt().toLocalDate().format(fmt);
            if (dailyCounts.containsKey(day)) {
                dailyCounts.put(day, dailyCounts.get(day) + 1);
            }
        }

        List<Long> counts = new ArrayList<>(dailyCounts.values());
        double mean = counts.stream().mapToLong(Long::longValue).average().orElse(0);
        double variance = counts.stream().mapToDouble(c -> Math.pow(c - mean, 2)).average().orElse(0);
        double std = Math.sqrt(variance);
        double todayCount = counts.get(counts.size() - 1); // 最后一天

        if (std > 0 && todayCount > mean + 3 * std) {
            result.add(new AnomalyDetectionVO(
                "ORDER_SPIKE", "DANGER",
                String.format("今日订单量异常飙升（%d笔，远超均值%.1f）", (long) todayCount, mean),
                String.format("均值=%.1f，标准差=%.1f，今日=%d（>均值+3σ）", mean, std, (long) todayCount),
                now.toString()
            ));
        } else if (std > 0 && todayCount > mean + 2 * std) {
            result.add(new AnomalyDetectionVO(
                "ORDER_SPIKE", "WARNING",
                String.format("今日订单量偏高（%d笔，较均值%.1f增长）", (long) todayCount, mean),
                String.format("均值=%.1f，标准差=%.1f，今日=%d（>均值+2σ）", mean, std, (long) todayCount),
                now.toString()
            ));
        }

        return result;
    }

    // 刷单检测：1小时内同一IP>5单 或 同一买家>3单 视为异常
    private List<AnomalyDetectionVO> detectBrushOrders(List<Order> allOrders, LocalDateTime now) {
        List<AnomalyDetectionVO> result = new ArrayList<>();
        LocalDateTime oneHourAgo = now.minusHours(1);

        // 按IP统计1小时内订单数
        Map<String, Long> ipCounts = new HashMap<>();
        for (Order o : allOrders) {
            if (o.getCreatedAt() == null || o.getCreatedAt().isBefore(oneHourAgo)) continue;
            String ip = o.getIpAddress();
            if (ip == null || ip.isEmpty() || "—".equals(ip) || "未知".equals(ip)) continue;
            ipCounts.merge(ip, 1L, Long::sum);
        }
        for (Map.Entry<String, Long> e : ipCounts.entrySet()) {
            if (e.getValue() > 5) {
                result.add(new AnomalyDetectionVO(
                    "BRUSH_ORDER", "DANGER",
                    String.format("IP %s 在1小时内下单%d次（疑似刷单）", e.getKey(), e.getValue()),
                    String.format("IP=%s，1小时内订单数=%d（>5）", e.getKey(), e.getValue()),
                    now.toString()
                ));
            }
        }

        // 按买家统计1小时内订单数
        Map<Long, Long> buyerCounts = new HashMap<>();
        for (Order o : allOrders) {
            if (o.getCreatedAt() == null || o.getCreatedAt().isBefore(oneHourAgo)) continue;
            if (o.getBuyerId() == null) continue;
            buyerCounts.merge(o.getBuyerId(), 1L, Long::sum);
        }
        for (Map.Entry<Long, Long> e : buyerCounts.entrySet()) {
            if (e.getValue() > 3) {
                result.add(new AnomalyDetectionVO(
                    "BRUSH_ORDER", "WARNING",
                    String.format("买家 #%d 在1小时内下单%d次（疑似刷单）", e.getKey(), e.getValue()),
                    String.format("buyerId=%d，1小时内订单数=%d（>3）", e.getKey(), e.getValue()),
                    now.toString()
                ));
            }
        }

        return result;
    }

    // 价格异常：当前订单单价 < 商品历史均价的10% 视为异常（可能是标价错误）
    private List<AnomalyDetectionVO> detectPriceAnomalies() {
        List<AnomalyDetectionVO> result = new ArrayList<>();
        // 历史已完成订单（算历史均价）
        List<Order> completed = orderRepository.search(null, null, 40);
        // 尚在待处理状态的订单（需要检测价格是否异常）
        List<Order> pending = orderRepository.search(null, null, 10);

        // 按商品统计历史平均单价
        Map<Long, List<BigDecimal>> priceByProduct = new HashMap<>();
        for (Order o : completed) {
            if (o.getTotalPrice() == null || o.getQuantity() == null || o.getQuantity() == 0) continue;
            BigDecimal unitPrice = o.getTotalPrice().divide(BigDecimal.valueOf(o.getQuantity()), 2, RoundingMode.HALF_UP);
            priceByProduct.computeIfAbsent(o.getProductId(), k -> new ArrayList<>()).add(unitPrice);
        }

        // 待处理订单价格对比历史
        for (Order o : pending) {
            List<BigDecimal> history = priceByProduct.get(o.getProductId());
            if (history == null || history.size() < 3) continue; // 至少3条历史才判断
            double avgHistorical = history.stream().mapToDouble(BigDecimal::doubleValue).average().orElse(0);
            if (avgHistorical <= 0) continue;
            BigDecimal unitPrice = o.getTotalPrice().divide(BigDecimal.valueOf(o.getQuantity()), 2, RoundingMode.HALF_UP);
            if (unitPrice.doubleValue() < avgHistorical * 0.1) {
                result.add(new AnomalyDetectionVO(
                    "PRICE_ANOMALY", "WARNING",
                    String.format("商品 #%d 新订单单价异常（¥%.2f，远低于历史均价¥%.2f）",
                        o.getProductId(), unitPrice.doubleValue(), avgHistorical),
                    String.format("商品ID=%d，当前单价=¥%.2f，历史均价=¥%.2f（<10%%）",
                        o.getProductId(), unitPrice.doubleValue(), avgHistorical),
                    o.getCreatedAt() != null ? o.getCreatedAt().toString() : ""
                ));
            }
        }
        return result;
    }

    // 获取监控摘要（给仪表盘用）
    public Map<String, Object> getAnomalySummary() {
        List<AnomalyDetectionVO> anomalies = detectAnomalies();
        long dangerCount = anomalies.stream().filter(a -> "DANGER".equals(a.level())).count();
        long warningCount = anomalies.stream().filter(a -> "WARNING".equals(a.level())).count();
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAnomalies", anomalies.size());
        summary.put("dangerCount", dangerCount);
        summary.put("warningCount", warningCount);
        summary.put("level", dangerCount > 0 ? "DANGER" : warningCount > 0 ? "WARNING" : "OK");
        summary.put("anomalies", anomalies);
        return summary;
    }

    // ==================== 销售趋势预测（线性回归 + 未来7天预测）====================
    public SalesForecastVO forecastSales(int historyDays, int forecastDays) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusDays(historyDays);

        // 收集历史每日订单数和销售额
        List<Order> allOrders = orderRepository.search(null, null, null);
        Map<String, Map<String, Object>> dailyData = new LinkedHashMap<>();
        for (int i = 0; i <= historyDays; i++) {
            String day = start.plusDays(i).toLocalDate().toString();
            dailyData.put(day, new HashMap<>() {{
                put("orders", 0L);
                put("revenue", BigDecimal.ZERO);
            }});
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (Order o : allOrders) {
            if (o.getCreatedAt() == null) continue;
            String day = o.getCreatedAt().toLocalDate().format(fmt);
            if (!dailyData.containsKey(day)) continue;
            Map<String, Object> d = dailyData.get(day);
            d.put("orders", (Long) d.get("orders") + 1);
            d.put("revenue", ((BigDecimal) d.get("revenue")).add(o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO));
        }

        // 线性回归：x = 天序号(1..n), y = 每日订单数
        List<Map.Entry<String, Map<String, Object>>> entries = new ArrayList<>(dailyData.entrySet());
        int n = entries.size();
        double[] x = new double[n];
        double[] y = new double[n];
        for (int i = 0; i < n; i++) {
            x[i] = i + 1;
            y[i] = ((Number) entries.get(i).getValue().get("orders")).doubleValue();
        }

        // 计算斜率(slope)和截距(intercept)
        double xMean = (n + 1) / 2.0;
        double yMean = 0;
        for (double v : y) yMean += v;
        yMean /= n;

        double numerator = 0, denominator = 0;
        for (int i = 0; i < n; i++) {
            numerator += (x[i] - xMean) * (y[i] - yMean);
            denominator += (x[i] - xMean) * (x[i] - xMean);
        }
        double slope = denominator == 0 ? 0 : numerator / denominator;
        double intercept = yMean - slope * xMean;

        // R² 决定系数
        double ssRes = 0, ssTot = 0;
        for (int i = 0; i < n; i++) {
            double yPred = slope * x[i] + intercept;
            ssRes += Math.pow(y[i] - yPred, 2);
            ssTot += Math.pow(y[i] - yMean, 2);
        }
        double rSquared = ssTot == 0 ? 1.0 : 1 - ssRes / ssTot;

        // 残差标准差（用于置信区间）
        double residualStd = Math.sqrt(ssRes / Math.max(n - 2, 1));

        // 判断趋势
        String trend = slope > 0.1 ? "上涨" : slope < -0.1 ? "下跌" : "持平";
        String confidence = rSquared > 0.7 ? "高" : rSquared > 0.3 ? "中" : "低";

        // 预测未来 N 天
        List<SalesForecastVO.ForecastDayVO> forecast = new ArrayList<>();
        double lastY = y[n - 1];
        double lastRevenue = ((Number) entries.get(n - 1).getValue().get("revenue")).doubleValue();
        double avgDailyRevenue = lastRevenue / Math.max(lastY, 1);

        for (int i = 1; i <= forecastDays; i++) {
            String futureDay = now.plusDays(i).toLocalDate().toString();
            double predictedOrders = Math.max(0, slope * (n + i) + intercept);
            double tValue = 2.0; // 近似95%置信区间
            double margin = tValue * residualStd * Math.sqrt(1.0 + 1.0/n + Math.pow(i, 2) / (n * (n + 1) * (2 * n + 1) / 6));
            forecast.add(new SalesForecastVO.ForecastDayVO(
                futureDay,
                Math.round(predictedOrders * 10) / 10.0,
                Math.round(predictedOrders * avgDailyRevenue * 100) / 100.0,
                Math.max(0, Math.round((predictedOrders - margin) * 10) / 10.0),
                Math.round((predictedOrders + margin) * 10) / 10.0
            ));
        }

        // 摘要
        Map<String, Object> summary = new HashMap<>();
        summary.put("historyDays", historyDays);
        summary.put("forecastDays", forecastDays);
        summary.put("avgDailyOrders", Math.round(yMean * 10) / 10.0);
        summary.put("todayOrders", (long) y[n - 1]);
        summary.put("slope", Math.round(slope * 100) / 100.0);
        summary.put("trend", trend);
        summary.put("confidence", confidence);
        summary.put("rSquared", Math.round(rSquared * 100) / 100.0);
        summary.put("lastUpdated", now.toString());

        return new SalesForecastVO(trend, slope, rSquared, confidence, forecast, summary);
    }

}