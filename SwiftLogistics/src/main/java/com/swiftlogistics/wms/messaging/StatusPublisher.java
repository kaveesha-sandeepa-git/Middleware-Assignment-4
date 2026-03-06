package com.swiftlogistics.wms.messaging;

import com.swiftlogistics.wms.config.RabbitMQConfig;
import com.swiftlogistics.wms.entity.PackageEntity;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

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