import { assertEquals } from "https://deno.land/std@0.191.0/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { consumeNewlines, consumeEvents, EventInfo } from "./helpers.ts";

enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSED = 2,
}

export class EventSource extends EventTarget {
  #url: string;
  #withCredentials = false;
  #events: Map<string, EventListenerOrEventListenerObject>;
  #readyState: ReadyState = ReadyState.CONNECTING;
  #abortController: AbortController | undefined;
  #chunkBuffer = "";
  eventBuffer = [] as string[];

  constructor(url: string, opts = { connect: true }) {
    super();
    this.#url = url;
    this.#events = new Map();

    if (opts.connect) {
      this.#connect().catch((err) => {
        console.error(err);
        // TODO: trigger the err listener
      });
    }
  }

  get readyState() {
    return this.#readyState;
  }

  async #connect() {
    this.#abortController = new AbortController();
    const response = await fetch(this.url, {
      signal: this.#abortController.signal,
      headers: { Accept: "text/event-stream" },
    });
    this.#readyState = ReadyState.OPEN;
    // TODO: trigger the open listener

    if (!response.body) {
      this.#readyState = ReadyState.CLOSED;
      throw new Error("response.body is empty");
    }

    for await (const chunk of response.body) {
      if (this.readyState === ReadyState.CLOSED) {
        break;
      }
      this.parseChunk(chunk);
    }
  }

  close() {
    if (this.#abortController) {
      this.#abortController.abort();
    }
    this.#readyState = ReadyState.CLOSED;
  }

  get url() {
    return this.#url;
  }

  get withCredentials() {
    return this.#withCredentials;
  }

  set onmessage(handler: EventListenerOrEventListenerObject) {
    this.#events.set("message", handler);
  }

  set onerror(handler: EventListenerOrEventListenerObject) {
    this.#events.set("error", handler);
  }

  set onopen(handler: EventListenerOrEventListenerObject) {
    this.#events.set("open", handler);
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    if (!listener) {
      return;
    }
    if (type === "message" || type === "open" || type === "error") {
      this.#events.set(type, listener);
    } else {
      super.addEventListener(type, listener, options);
    }
  }

  #parseEvent(eventInfo: EventInfo) {
    const { lines } = eventInfo;
    let name = "";
    const data = [];
    for (const line of lines) {
      if (line.startsWith("event:")) {
        name = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        data.push(line.slice(5).trim());
      } else if (line.startsWith(":")) {
        // Ignore.
      }
    }

    if (!name) {
      name = "message";
    }

    let event;
    if (name === "message" || (name !== "error" && name !== "open")) {
      event = new MessageEvent(name, { data: data.join("\n") });
    } else {
      event = new Event(name);
    }
    const handler = this.#events.get(name);
    if (typeof handler === "function") {
      handler(event);
    } else if (handler?.handleEvent) {
      handler.handleEvent(event);
    } else {
      this.dispatchEvent(event);
    }
  }

  parseChunk(chunk: Uint8Array) {
    const decoder = new TextDecoder();
    this.#chunkBuffer += decoder.decode(chunk);

    const { lines, buffer } = consumeNewlines(this.#chunkBuffer);

    this.#chunkBuffer = buffer;
    this.eventBuffer.push(...lines);

    const { events, buffer: eventBuffer } = consumeEvents(this.eventBuffer);
    this.eventBuffer = eventBuffer;

    for (const event of events) {
      this.#parseEvent(event);
    }
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
const customEventSchema = z.object({
  event: z.literal("custom"),
  data: z.string(),
  id: z.string().optional(),
  retry: z.number().optional(),
});

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
