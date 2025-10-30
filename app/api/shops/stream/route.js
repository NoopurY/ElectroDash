import { addClient, removeClient } from "@/lib/sse";

export async function GET(req) {
  // Create a ReadableStream that can be used for Server-Sent Events (SSE)
  const stream = new ReadableStream({
    start(controller) {
      // Register this controller so other parts of the app can enqueue events
      addClient(controller);

      // Send a small initial event so the client knows it's connected
      controller.enqueue(`data: ${JSON.stringify({ message: "connected" })}\n\n`);

      // When the request is aborted/closed, remove client and close controller
      try {
        req.signal.addEventListener("abort", () => {
          removeClient(controller);
          try {
            controller.close();
          } catch (e) {}
        });
      } catch (e) {
        // Some runtimes may not expose req.signal; ignore if unavailable
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
