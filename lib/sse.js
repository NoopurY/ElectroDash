// Simple in-memory Server-Sent Events broadcaster.
// Note: this uses an in-memory list of stream controllers and will only
// work for a single server process. For production use a shared pub/sub
// (Redis, Pusher, Supabase, etc.) is recommended.

const clients = new Set();

export function addClient(controller) {
  clients.add(controller);
}

export function removeClient(controller) {
  clients.delete(controller);
}

export function sendEvent(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const controller of clients) {
    try {
      controller.enqueue(payload);
    } catch (err) {
      // ignore per-client errors
    }
  }
}

export function getClientCount() {
  return clients.size;
}
