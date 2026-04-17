package org.zyq.transaction.common.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 操作日志
 */
@Entity
@Table(name = "operation_logs")
public class OperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 操作人账号 */
    @Column(name = "operator_account", length = 64)
    private String operatorAccount;

    /** 操作人角色：CUSTOMER / SALES / ADMIN */
    @Column(name = "operator_role", length = 32)
    private String operatorRole;

    /** 操作类型 */
    @Column(name = "action", length = 64, nullable = false)
    private String action;

    /** 操作描述 */
    @Column(name = "description", length = 512)
    private String description;

    /** 操作目标类型（如 PRODUCT / USER / CATEGORY） */
    @Column(name = "target_type", length = 32)
    private String targetType;

    /** 操作目标ID */
    @Column(name = "target_id")
    private Long targetId;

    /** 操作前状态 */
    @Column(name = "before_state", length = 255)
    private String beforeState;

    /** 操作后状态 */
    @Column(name = "after_state", length = 255)
    private String afterState;

    /** 操作人IP */
    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOperatorAccount() { return operatorAccount; }
    public void setOperatorAccount(String operatorAccount) { this.operatorAccount = operatorAccount; }

    public String getOperatorRole() { return operatorRole; }
    public void setOperatorRole(String operatorRole) { this.operatorRole = operatorRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }

    public String getBeforeState() { return beforeState; }
    public void setBeforeState(String beforeState) { this.beforeState = beforeState; }

    public String getAfterState() { return afterState; }
    public void setAfterState(String afterState) { this.afterState = afterState; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
