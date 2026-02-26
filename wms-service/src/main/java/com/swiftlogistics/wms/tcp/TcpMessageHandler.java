@Component
public class TcpMessageHandler {

    private final PackageService service;
    private final ObjectMapper mapper = new ObjectMapper();

    @ServiceActivator(inputChannel = "requestChannel",
                      outputChannel = "replyChannel")
    public byte[] handle(byte[] message) throws Exception {

        String json = new String(message);

        Map<String, String> request =
                mapper.readValue(json, Map.class);

        PackageEntity pkg =
                service.createPackage(
                        request.get("orderId"),
                        request.get("clientId"),
                        request.get("deliveryAddress")
                );

        return (mapper.writeValueAsString(pkg) + "\n").getBytes();
    }
}