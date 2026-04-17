package org.zyq.transaction.transaction.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.zyq.transaction.transaction.service.AnalyticsService;
import org.zyq.transaction.transaction.vo.UserPortraitVO;
import org.zyq.transaction.transaction.vo.RankingItemVO;
import org.zyq.transaction.transaction.vo.DailyTrendVO;
import org.zyq.transaction.transaction.vo.MonthlyTrendVO;
import org.zyq.transaction.transaction.vo.CategoryAnalysisVO;
import org.zyq.transaction.transaction.vo.RecommendedProductVO;
import org.zyq.transaction.transaction.vo.SalesForecastVO;
import org.zyq.transaction.transaction.vo.TrendAnalysisVO;
import org.zyq.transaction.transaction.vo.AnomalyDetectionVO;
import org.zyq.transaction.transaction.vo.SupplyDemandVO;

import java.util.List;
import java.util.Map;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired private AnalyticsService analyticsService;

    // 用户画像（地域 + 购买力 + 品类偏好）
    @GetMapping("/user-portrait")
    public ApiResponse<UserPortraitVO> getUserPortrait() {
        return ApiResponse.success(analyticsService.getUserPortrait());
    }

    // 销售排行榜
    @GetMapping("/sales-ranking")
    public ApiResponse<List<RankingItemVO>> getSalesRanking(
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(analyticsService.getSalesRanking(limit));
    }

    // 销售趋势（日）
    @GetMapping("/sales-trend/daily")
    public ApiResponse<List<DailyTrendVO>> getDailyTrend(
            @RequestParam(defaultValue = "30") int days) {
        return ApiResponse.success(analyticsService.getDailyTrend(days));
    }

    // 销售趋势（月）
    @GetMapping("/sales-trend/monthly")
    public ApiResponse<List<MonthlyTrendVO>> getMonthlyTrend(
            @RequestParam(defaultValue = "6") int months) {
        return ApiResponse.success(analyticsService.getMonthlyTrend(months));
    }

    // 趋势研判分析（环比涨跌 + 运营建议）
    @GetMapping("/trend-analysis")
    public ApiResponse<TrendAnalysisVO> getTrendAnalysis(
            @RequestParam(defaultValue = "7") int days) {
        return ApiResponse.success(analyticsService.getTrendAnalysis(days));
    }

    // 品类供需分析
    @GetMapping("/category-analysis")
    public ApiResponse<List<CategoryAnalysisVO>> getCategoryAnalysis() {
        return ApiResponse.success(analyticsService.getCategoryAnalysis());
    }

    // 供需监控（预警）
    @GetMapping("/supply-demand")
    public ApiResponse<List<SupplyDemandVO>> getSupplyDemand() {
        return ApiResponse.success(analyticsService.getSupplyDemand());
    }

    // 商品浏览趋势（单品分析）
    @GetMapping("/product-trend")
    public ApiResponse<Map<String, Object>> getProductTrend(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "14") int days) {
        return ApiResponse.success(analyticsService.getProductTrend(productId, days));
    }

    // 看了又买（协同过滤推荐）
    @GetMapping("/also-bought")
    public ApiResponse<List<RecommendedProductVO>> getAlsoBought(
            @RequestParam Long productId,
            @RequestParam(required = false) Long viewerId,
            @RequestParam(defaultValue = "6") int limit) {
        return ApiResponse.success(analyticsService.getAlsoBought(productId, viewerId, limit));
    }

    // 热销推荐（首页用）
    @GetMapping("/recommendations")
    public ApiResponse<List<RecommendedProductVO>> getRecommendations(
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(analyticsService.getPopularRecommendations(limit));
    }

    // 个性化首页推荐（基于用户品类偏好 + 热销）
    @GetMapping("/personalized")
    public ApiResponse<List<RecommendedProductVO>> getPersonalized(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(analyticsService.getPersonalizedRecommendations(userId, limit));
    }

    // 销售异常检测摘要（给仪表盘用）
    @GetMapping("/anomaly-summary")
    public ApiResponse<Map<String, Object>> getAnomalySummary() {
        return ApiResponse.success(analyticsService.getAnomalySummary());
    }

    // 销售异常详情列表
    @GetMapping("/anomalies")
    public ApiResponse<List<AnomalyDetectionVO>> getAnomalies() {
        return ApiResponse.success(analyticsService.detectAnomalies());
    }

    // 销售趋势预测（基于线性回归）
    @GetMapping("/forecast")
    public ApiResponse<SalesForecastVO> getForecast(
            @RequestParam(defaultValue = "30") int historyDays,
            @RequestParam(defaultValue = "7") int forecastDays) {
        return ApiResponse.success(analyticsService.forecastSales(historyDays, forecastDays));
    }

    // 内部类：统一响应格式
    public static class ApiResponse<T> {
        public int code;
        public String message;
        public T data;
        public ApiResponse(int code, String message, T data) {
            this.code = code; this.message = message; this.data = data;
        }
        public static <T> ApiResponse<T> success(T data) {
            return new ApiResponse<>(0, "success", data);
        }
    }
}
