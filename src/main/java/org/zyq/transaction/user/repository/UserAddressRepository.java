package org.zyq.transaction.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zyq.transaction.user.entity.UserAddress;
import java.util.List;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserId(Long userId);

    @Query("""
            select new map(
                ua.province as province,
                count(ua.userId) as userCount
            )
            from UserAddress ua
            where ua.province is not null and ua.province != ''
            group by ua.province
            order by userCount desc
            """)
    List<Object> countByProvince();

    @Query("""
            select new map(
                ua.city as city,
                count(ua.userId) as userCount
            )
            from UserAddress ua
            where ua.province = :province and ua.city is not null and ua.city != ''
            group by ua.city
            order by userCount desc
            """)
    List<Object> countByCity(@Param("province") String province);
}
