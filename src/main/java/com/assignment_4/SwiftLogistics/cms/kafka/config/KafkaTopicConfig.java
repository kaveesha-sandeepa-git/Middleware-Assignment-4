package com.assignment_4.SwiftLogistics.cms.kafka.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Creates topics automatically (useful for local dev).
 */
@Configuration
public class KafkaTopicConfig {

    @Bean
    NewTopic orderCreatedTopic(@Value("${cms.kafka.topic.order-created:order-created}") String topic) {
        return new NewTopic(topic, 1, (short) 1);
    }

    @Bean
    NewTopic orderValidatedTopic(@Value("${cms.kafka.topic.order-validated:order-validated}") String topic) {
        return new NewTopic(topic, 1, (short) 1);
    }

    @Bean
    NewTopic orderValidationFailedTopic(@Value("${cms.kafka.topic.order-validation-failed:order-validation-failed}") String topic) {
        return new NewTopic(topic, 1, (short) 1);
    }
}