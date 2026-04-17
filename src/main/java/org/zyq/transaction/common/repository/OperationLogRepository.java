package org.zyq.transaction.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zyq.transaction.common.entity.OperationLog;

import java.time.LocalDateTime;
import java.util.List;

public interface OperationLogRepository extends JpaRepository<OperationLog, Long> {

    @Query("""
            select o from OperationLog o
            where (:operatorAccount is null or o.operatorAccount = :operatorAccount)
              and (:action is null or o.action = :action)
              and (:targetType is null or o.targetType = :targetType)
            order by o.createdAt desc
            """)
    List<OperationLog> search(@Param("operatorAccount") String operatorAccount,
                               @Param("action") String action,
                               @Param("targetType") String targetType);

    List<OperationLog> findTop100ByOrderByCreatedAtDesc();

    @Query("""
            select o from OperationLog o
            where o.createdAt between :start and :end
            order by o.createdAt desc
            """)
    List<OperationLog> findByDateRange(@Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);
}
