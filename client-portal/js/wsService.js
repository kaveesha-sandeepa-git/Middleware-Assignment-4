// Optional WebSocket service.
// If you don't have a backend WS endpoint yet, this will fail silently and your UI still works.

class WsService {
  constructor(url) {
    this.url = url;
    this.handlers = new Map(); // eventName -> [fn]
    this.orderSubscriptions = new Map(); // orderId -> [fn]
    this.ws = null;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("[ws] connected");
      };

      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);

          // Expected message examples:
          // { event: "delivery_status_updated", orderId: "...", status: "in_transit" }
          // { event: "order_created", orderId: "..." }
          const event = data?.event;
          if (!event) return;

          const list = this.handlers.get(event) || [];
          list.forEach((fn) => fn(data));

          if (data.orderId && this.orderSubscriptions.has(data.orderId)) {
            this.orderSubscriptions.get(data.orderId).forEach((fn) => fn(data));
          }
        } catch (e) {
          console.warn("[ws] invalid message", e);
        }
      };

      this.ws.onerror = (e) => {
        console.warn("[ws] error", e);
      };

      this.ws.onclose = () => {
        console.warn("[ws] closed");
      };
    } catch (e) {
      console.warn("[ws] connect failed", e);
    }
  }

  on(eventName, fn) {
    const list = this.handlers.get(eventName) || [];
    list.push(fn);
    this.handlers.set(eventName, list);
  }

  subscribe(orderId, fn) {
    const list = this.orderSubscriptions.get(orderId) || [];
    list.push(fn);
    this.orderSubscriptions.set(orderId, list);

    // optional: tell server we want updates for this order
    this.send({ action: "subscribe", orderId });
  }

  send(obj) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(obj));
  }
}

// Change this if your backend WS URL differs.
// Typical: ws://localhost:4000/ws
const WS_URL = "ws://localhost:4000/ws";

export const wsService = new WsService(WS_URL);
wsService.connect();

// Make it compatible with your snippet (uses window.wsService)
window.wsService = wsService;