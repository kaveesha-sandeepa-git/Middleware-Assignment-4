package com.assignment_4.SwiftLogistics.domain.repositories;

import com.assignment_4.SwiftLogistics.domain.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("select o.OrderStatus from Order o where o.orderId = :orderId")
    Optional<String> findStatusByOrderId(@Param("orderId") UUID orderId);

    @Modifying
    @Transactional
    @Query("update Order o set o.OrderStatus = :orderStatus where o.orderId = :orderId")
    int updateStatus(@Param("orderId") UUID orderId, @Param("orderStatus") String orderStatus);

    Optional<Order> findByOrderNo(String orderNo);
}