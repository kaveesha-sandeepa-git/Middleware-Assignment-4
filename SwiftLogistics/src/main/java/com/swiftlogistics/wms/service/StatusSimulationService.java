package com.swiftlogistics.wms.service;

import com.swiftlogistics.wms.entity.PackageEntity;
import com.swiftlogistics.wms.enums.PackageStatus;
import com.swiftlogistics.wms.repository.PackageRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@EnableScheduling
@RequiredArgsConstructor
public class StatusSimulationService {

    private final PackageRepository repository;
    private final PackageService service;

    @Scheduled(fixedRate = 10000)
    public void simulateStatusChanges() {

        List<PackageEntity> packages =
                repository.findAll();

        for (PackageEntity pkg : packages) {

            switch (pkg.getStatus()) {
                case RECEIVED -> service.updateStatus(pkg, PackageStatus.SORTED);
                case SORTED -> service.updateStatus(pkg, PackageStatus.STORED);
                case STORED -> service.updateStatus(pkg, PackageStatus.READY_FOR_LOADING);
                case READY_FOR_LOADING -> service.updateStatus(pkg, PackageStatus.LOADED);
            }
        }
    }
}