package com.swiftlogistics.wms.service;

import com.swiftlogistics.wms.entity.PackageEntity;
import com.swiftlogistics.wms.enums.PackageStatus;
import com.swiftlogistics.wms.messaging.StatusPublisher;
import com.swiftlogistics.wms.repository.PackageRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

@Service
public class PackageService {

    private final PackageRepository repository;
    private final StatusPublisher publisher;

    public PackageService(PackageRepository repository,
                          StatusPublisher publisher) {
        this.repository = repository;
        this.publisher = publisher;
    }

    public PackageEntity createPackage(String orderId,
                                       String clientId,
                                       String address) {

        PackageEntity pkg = new PackageEntity();
        pkg.setOrderId(orderId);
        pkg.setClientId(clientId);
        pkg.setDeliveryAddress(address);
        pkg.setStatus(PackageStatus.RECEIVED);
        pkg.setCreatedAt(LocalDateTime.now());
        pkg.setUpdatedAt(LocalDateTime.now());

        repository.save(pkg);

        publisher.publishStatusUpdate(pkg);

        return pkg;
    }

    public void updateStatus(PackageEntity pkg,
                             PackageStatus status) {

        pkg.setStatus(status);
        pkg.setUpdatedAt(LocalDateTime.now());

        repository.save(pkg);

        publisher.publishStatusUpdate(pkg);
    }

    public PackageEntity cancelPackage(String orderId) {
        PackageEntity pkg = repository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found for orderId: " + orderId));

        if (pkg.getStatus() != PackageStatus.LOADED) {
            updateStatus(pkg, PackageStatus.CANCELLED);
        }

        return pkg;
    }
}