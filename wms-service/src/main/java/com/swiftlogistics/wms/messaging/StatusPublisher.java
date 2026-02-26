@Component
public class StatusPublisher {

    private final RabbitTemplate rabbitTemplate;

    public StatusPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishStatusUpdate(PackageEntity pkg) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY,
                pkg
        );
    }
}