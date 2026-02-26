@Service
@EnableScheduling
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