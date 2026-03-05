# SwiftLogistics CMS Integration - Implementation Summary (SOAP + Saga Event Choreography)

## Overview
This document summarizes the CMS (Client Management System) integration implementation for **SwiftLogistics** using a **Choreography-based Saga pattern**.

- **CMS is SOAP/XML** (Spring-WS, XSD → JAXB generated classes)
- **Saga events** are published/consumed through a message broker (**Kafka recommended**, but you can also do RabbitMQ—pick one and keep consistent across all services)
- **PostgreSQL** persists CMS-side order records and saga processing state (optional but recommended)

This CMS component’s responsibility in the saga:
1. Listen for `OrderCreatedEvent`
2. Validate the order against client/contract rules (mocked, minimal)
3. Record the order in CMS DB (mocked but persisted)
4. Publish either:
   - `OrderValidatedEvent` (success), or
   - `OrderValidationFailedEvent` (failure/compensation trigger)

---

## Suggested Project Structure (CMS Service)

src/main/java/com/assignment_4/SwiftLogistics/
  cms/
    soap/
      endpoint/
        CmsEndpoint.java                    # SOAP API (CreateOrder, GetOrderStatus, UpdateOrderStatus)
      config/
        WebServiceConfig.java               # Spring-WS config + WSDL exposure
      schema/
        # (optional) helpers if you keep schema constants/mappers

    integration/
      events/
        # Event DTOs (Kafka payloads)
        OrderCreatedEvent.java
        OrderValidatedEvent.java
        OrderValidationFailedEvent.java

      publisher/
        CmsEventPublisher.java              # publish validated/failed events

      consumer/
        CmsEventConsumer.java               # consume OrderCreatedEvent -> validate -> publish outcome

      mapper/
        CmsEventMapper.java                 # map event -> SOAP request DTO (optional)

  services/
    service/
      CmsOrderService.java                  # "business" logic: validate + persist + status updates
    entities/
      Clients.java
      Contracts.java
      Order.java
      Billing.java
    repositories/
      ClientRepository.java
      ContractRepository.java
      OrderRepository.java
      BillingRepository.java

  config/
    MessagingConfig.java                    # Kafka (or Rabbit) configuration for topics/queues
    RestClientConfig.java                   # if you call external services (optional)

  SwiftLogisticsApplication.java

src/main/resources/
  cms.xsd
  application.properties

---

## Files to Create/Update (CMS)

### 1) Event Classes (cms/integration/events/)
- **OrderCreatedEvent.java**  
  Published by the middleware/order-service when a client submits an order.

- **OrderValidatedEvent.java**  
  Published by CMS when the contract + client validation passes and CMS records the order.

- **OrderValidationFailedEvent.java**  
  Published by CMS when validation fails (e.g., contract not found, contract expired).

> Keep event payloads small and include a `correlationId` (orderId) to trace saga.

---

### 2) CMS Messaging Consumer (cms/integration/consumer/)
- **CmsEventConsumer.java**
  - Subscribes to `order-created` topic
  - Calls `CmsOrderService.validateAndRecord(...)`
  - Publishes success or failure event

---

### 3) CMS Messaging Publisher (cms/integration/publisher/)
- **CmsEventPublisher.java**
  - Publishes to:
    - `order-validated`
    - `order-validation-failed`

---

### 4) CMS Business Service (services/service/)
- **CmsOrderService.java**
  - Validates: clientId exists, contractId exists, contract active (mock rule)
  - Creates/updates CMS Order record (JPA)
  - Returns a result object that the consumer turns into events

This keeps SOAP endpoint logic separate from saga logic.

---

### 5) SOAP API (already done)
You already have:
- `CmsEndpoint.java`
- `WebServiceConfig.java`
- `cms.xsd` + generated `com.assignment_4.SwiftLogistics.wsdl.*`

These remain the external interface if you want to demo SOAP directly.

---

## Saga Choreography Flow (CMS part)

1. Middleware publishes `OrderCreatedEvent` → topic: `order-created`
   ↓
2. **CMS Consumer listens** (`CmsEventConsumer`)
   ↓
3. CMS validates order (contract/client checks)
   ↓
4. CMS records order into PostgreSQL
   ↓
5a. On success → publish `OrderValidatedEvent` → topic: `order-validated`
5b. On failure → publish `OrderValidationFailedEvent` → topic: `order-validation-failed`

CMS is done; next service (WMS) continues the saga.

---

## Key Features (CMS)

### SOAP/XML Support (Protocol Bridging)
- SOAP endpoint exposes:
  - `CreateOrderRequest/Response`
  - `GetOrderStatusRequest/Response`
  - `UpdateOrderStatusRequest/Response`

### Event-Driven Saga Compatibility
- CMS participates in saga without synchronous coupling:
  - It reacts to events
  - It emits events

### “Never lose an order”
For production-grade: use one of these patterns
- Kafka + consumer offsets (durable)
- Transactional outbox pattern (DB table + publisher)
- Retry + DLQ topic

For prototype: at least log + store failed orders for retry.

---

## Configuration Properties (CMS)

Example (Kafka):
```properties
spring.application.name=swiftlogistics-cms

# DB
spring.datasource.url=jdbc:postgresql://localhost:5432/swiftlogistics
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update

# Kafka
spring.kafka.bootstrap-servers=localhost:9092
cms.kafka.topic.order-created=order-created
cms.kafka.topic.order-validated=order-validated
cms.kafka.topic.order-validation-failed=order-validation-failed

# SOAP
server.port=8081