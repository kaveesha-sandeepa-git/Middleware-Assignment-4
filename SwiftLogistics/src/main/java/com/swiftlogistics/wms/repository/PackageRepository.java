package com.swiftlogistics.wms.repository;

import com.swiftlogistics.wms.entity.PackageEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PackageRepository
        extends JpaRepository<PackageEntity, String> {

        Optional<PackageEntity> findByOrderId(String orderId);
}