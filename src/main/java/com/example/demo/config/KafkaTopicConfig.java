package com.example.demo.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration
public class KafkaTopicConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    // Kafka Topics for Saga Choreography
    
    @Bean
    public NewTopic warehouseConfirmedTopic() {
        return new NewTopic("warehouse-confirmed", 3, (short) 1);
    }

    @Bean
    public NewTopic routeOptimizedTopic() {
        return new NewTopic("route-optimized", 3, (short) 1);
    }

    @Bean
    public NewTopic routeOptimizationFailedTopic() {
        return new NewTopic("route-optimization-failed", 3, (short) 1);
    }

    @Bean
    public NewTopic orderCreatedTopic() {
        return new NewTopic("order-created", 3, (short) 1);
    }

    @Bean
    public NewTopic orderValidatedTopic() {
        return new NewTopic("order-validated", 3, (short) 1);
    }

    @Bean
    public NewTopic orderValidationFailedTopic() {
        return new NewTopic("order-validation-failed", 3, (short) 1);
    }

    @Bean
    public NewTopic deliveryAssignedTopic() {
        return new NewTopic("delivery-assigned", 3, (short) 1);
    }

    @Bean
    public NewTopic deliveryCompletedTopic() {
        return new NewTopic("delivery-completed", 3, (short) 1);
    }

    @Bean
    public NewTopic compensationTopic() {
        return new NewTopic("compensation", 3, (short) 1);
    }
}
