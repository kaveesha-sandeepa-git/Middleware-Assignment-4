package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.model.Route;

public interface RouteRepository extends JpaRepository<Route, Long> {

	@Query("SELECT r FROM Route r WHERE r.deliveryId.id = :deliveryId ORDER BY r.createdAt DESC")
	Optional<Route> findFirstByDeliveryId_IdOrderByCreatedAtDesc(@Param("deliveryId") Long deliveryId);

	List<Route> findByOptimizedRouteIdIsNotNull();

}
