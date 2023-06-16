import { assertEquals } from "../../deps.ts";
import { EventSource } from "../mod.ts";

Deno.test("Event parsing", async (t) => {
  const source = new EventSource("http://localhost:8000", { connect: false });
  let messageEvents: string[] = [];
  source.addEventListener("message", (event: Event) => {
    const messageEvent = event as unknown as MessageEvent;
    event.type === "message" && messageEvents.push(messageEvent.data);
  });

  const encoder = new TextEncoder();
  await t.step("handles empty chunks", () => {
    const chunk = encoder.encode("");
    source.parseChunk(chunk);
    assertEquals(messageEvents, []);
  });

  await t.step("handles partial chunks", () => {
    const chunk = encoder.encode("event: message\ndata: hello\n");
    source.parseChunk(chunk);
    assertEquals(messageEvents, []);
    source.parseChunk(encoder.encode("\n"));
    assertEquals(messageEvents, ["hello"]);
  });

  await t.step("handles multiple events in the same chunk", () => {
    messageEvents = [];
    const chunk = new TextEncoder().encode(
      `event: message\ndata: hello\n\nevent: message\ndata: world\n\n`
    );
    source.parseChunk(chunk);
    assertEquals(messageEvents, ["hello", "world"]);
  });
});
