package org.zyq.transaction.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.zyq.transaction.common.entity.OperationLog;
import org.zyq.transaction.common.repository.OperationLogRepository;
import org.zyq.transaction.user.entity.User;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 操作日志服务
 * 提供统一的日志记录接口，供 AdminController 等调用
 */
@Service
public class OperationLogService {

    private final OperationLogRepository repo;

    public OperationLogService(OperationLogRepository repo) {
        this.repo = repo;
    }

    /** 记录操作 */
    public void log(String operatorAccount, String operatorRole,
                    String action, String description,
                    String targetType, Long targetId,
                    String beforeState, String afterState,
                    String ip) {
        OperationLog entry = new OperationLog();
        entry.setOperatorAccount(operatorAccount);
        entry.setOperatorRole(operatorRole);
        entry.setAction(action);
        entry.setDescription(description);
        entry.setTargetType(targetType);
        entry.setTargetId(targetId);
        entry.setBeforeState(beforeState);
        entry.setAfterState(afterState);
        entry.setIpAddress(ip != null ? ip : "unknown");
        entry.setCreatedAt(LocalDateTime.now());
        repo.save(entry);
    }

    /** 简化版：记录操作（不记录前后状态） */
    public void log(String operatorAccount, String operatorRole,
                    String action, String description,
                    String targetType, Long targetId) {
        log(operatorAccount, operatorRole, action, description, targetType, targetId, null, null, null);
    }

    /** 简化版：记录操作（含IP） */
    public void log(String operatorAccount, String operatorRole,
                    String action, String description,
                    String targetType, Long targetId, String ip) {
        log(operatorAccount, operatorRole, action, description, targetType, targetId, null, null, ip);
    }

    /** 查询所有日志（最近100条） */
    public List<Map<String, Object>> listAll() {
        return repo.findTop100ByOrderByCreatedAtDesc().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    /** 条件查询日志 */
    public List<Map<String, Object>> search(String operatorAccount, String action, String targetType) {
        return repo.search(operatorAccount, action, targetType).stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    /** 按时间范围查询 */
    public List<Map<String, Object>> listByDateRange(LocalDateTime start, LocalDateTime end) {
        return repo.findByDateRange(start, end).stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    private Map<String, Object> toMap(OperationLog o) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", o.getId());
        m.put("operatorAccount", o.getOperatorAccount() != null ? o.getOperatorAccount() : "—");
        m.put("operatorRole", o.getOperatorRole() != null ? o.getOperatorRole() : "—");
        m.put("action", o.getAction());
        m.put("description", o.getDescription() != null ? o.getDescription() : "—");
        m.put("targetType", o.getTargetType() != null ? o.getTargetType() : "—");
        m.put("targetId", o.getTargetId() != null ? o.getTargetId() : "—");
        m.put("beforeState", o.getBeforeState() != null ? o.getBeforeState() : "—");
        m.put("afterState", o.getAfterState() != null ? o.getAfterState() : "—");
        m.put("ipAddress", o.getIpAddress() != null ? o.getIpAddress() : "—");
        m.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : "—");
        return m;
    }
}
