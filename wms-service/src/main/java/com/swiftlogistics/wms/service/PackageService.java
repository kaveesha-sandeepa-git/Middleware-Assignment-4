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
}