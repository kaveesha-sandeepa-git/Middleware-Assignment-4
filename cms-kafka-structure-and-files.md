# SwiftLogistics CMS Integration (Kafka) — Structure + Minimal Implementation Files

You chose **Kafka**. Below is a CMS service structure + the exact minimal classes you need to make CMS participate in the **Saga choreography**:

- Consume: `order-created`
- Validate + record in CMS DB (PostgreSQL via JPA)
- Publish: `order-validated` OR `order-validation-failed`

This is designed to fit your existing code:
- `CmsEndpoint` + `OrderService` already exist (SOAP operations)
- Entities + repositories already exist under `com.assignment_4.SwiftLogistics.services.*`

---

## 1) Recommended structure (CMS service)

src/main/java/com/assignment_4/SwiftLogistics/
  cms/
    kafka/
      events/
        OrderCreatedEvent.java
        OrderValidatedEvent.java
        OrderValidationFailedEvent.java

      publisher/
        CmsEventPublisher.java

      consumer/
        CmsEventConsumer.java

    service/
      CmsSagaService.java

    config/
      KafkaTopicConfig.java

  services/
    entities/
      (your existing entities)
    repositories/
      (your existing repositories)

  CmsEndpoint.java            # your existing SOAP endpoint
  OrderService.java           # your existing SOAP backing service (optional to reuse)
  WebServiceConfig.java       # your existing SOAP config
  SwiftLogisticsApplication.java

---

## 2) Kafka event classes

### 2.1 OrderCreatedEvent (consumed)
Create this in:
`src/main/java/com/assignment_4/SwiftLogistics/cms/kafka/events/OrderCreatedEvent.java`