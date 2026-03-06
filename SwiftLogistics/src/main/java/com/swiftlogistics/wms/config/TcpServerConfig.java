package com.swiftlogistics.wms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.ip.tcp.TcpInboundGateway;
import org.springframework.integration.ip.tcp.connection.TcpNetServerConnectionFactory;
import org.springframework.integration.ip.tcp.serializer.ByteArrayLfSerializer;
import org.springframework.messaging.MessageChannel;

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