class TelemetryWebSocket {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.reconnectInterval = 3000;
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/telemetry';
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notifySubscribers({ type: 'STATUS', data: { connected: true } });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifySubscribers(message);
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifySubscribers({ type: 'STATUS', data: { connected: false } });
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch (e) {
      console.warn('WebSocket connection failed, will retry...', e);
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(data) {
    this.subscribers.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error('Error in WS subscriber callback', err);
      }
    });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }
}

export const wsService = new TelemetryWebSocket();
