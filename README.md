WMS

✅ TCP server (Spring Integration)

✅ Package persistence (JPA + DB)

✅ RabbitMQ publisher (for status updates)

✅ Simulated warehouse lifecycle

✅ Clean layered architecture


Middleware  ──TCP──►  WMS
                         │
                         ▼
                  PackageService
                         │
                         ▼
                      Database
                         │
                         ▼
                 RabbitMQ Publisher
                         │
                         ▼
                Middleware Subscriber


WMS responsibilities:

Receive CREATE_PACKAGE via TCP
Store package
Simulate status changes
Publish status updates to RabbitMQ





Project Structure (Production-Ready Layout)


wms-service/
│
├── pom.xml
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── swiftlogistics/
│   │   │           └── wms/
│   │   │
│   │   │               ├── WmsApplication.java
│   │   │
│   │   │               ├── config/
│   │   │               │     ├── TcpServerConfig.java
│   │   │               │     └── RabbitMQConfig.java
│   │   │
│   │   │               ├── tcp/
│   │   │               │     ├── TcpMessageHandler.java
│   │   │               │     └── dto/
│   │   │               │           ├── TcpRequest.java
│   │   │               │           └── TcpResponse.java
│   │   │
│   │   │               ├── entity/
│   │   │               │     └── PackageEntity.java
│   │   │
│   │   │               ├── repository/
│   │   │               │     └── PackageRepository.java
│   │   │
│   │   │               ├── service/
│   │   │               │     ├── PackageService.java
│   │   │               │     └── StatusSimulationService.java
│   │   │
│   │   │               ├── messaging/
│   │   │               │     └── StatusPublisher.java
│   │   │
│   │   │               └── enums/
│   │   │                     └── PackageStatus.java
│   │   │
│   │   └── resources/
│   │         ├── application.yml
│   │         └── logback-spring.xml (optional)
│   │
│   └── test/
│       └── java/
│           └── com/
│               └── swiftlogistics/
│                   └── wms/
│                       └── WmsApplicationTests.java
│
└── README.md (recommended for documentation)

How To Test

Run RabbitMQ (Docker recommended)

Start WMS

Send TCP request:
{"orderId":"ORD1","clientId":"CL1","deliveryAddress":"Colombo"}\n
      4. Watch:
DB inserts

Status changes every 10 sec


RabbitMQ publishes events

✔ Full TCP-based WMS
✔ Persistent storage
✔ Async status updates
✔ Event-driven messaging
✔ Scalable design
✔ Middleware-compliant architecture

