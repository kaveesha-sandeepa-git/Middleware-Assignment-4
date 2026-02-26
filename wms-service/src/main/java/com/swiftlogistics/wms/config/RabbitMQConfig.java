@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "wms.exchange";
    public static final String ROUTING_KEY = "wms.status";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }
}