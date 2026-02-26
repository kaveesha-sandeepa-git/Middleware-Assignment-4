@Configuration
public class TcpServerConfig {

    @Bean
    public TcpNetServerConnectionFactory server() {
        TcpNetServerConnectionFactory factory =
                new TcpNetServerConnectionFactory(9090);
        factory.setSerializer(new ByteArrayLfSerializer());
        factory.setDeserializer(new ByteArrayLfSerializer());
        return factory;
    }

    @Bean
    public TcpInboundGateway inboundGateway(
            TcpNetServerConnectionFactory factory) {

        TcpInboundGateway gateway =
                new TcpInboundGateway();

        gateway.setConnectionFactory(factory);
        gateway.setRequestChannel(requestChannel());
        gateway.setReplyChannel(replyChannel());

        return gateway;
    }

    @Bean
    public MessageChannel requestChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageChannel replyChannel() {
        return new DirectChannel();
    }
}