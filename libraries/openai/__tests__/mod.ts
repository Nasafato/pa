import { assertEquals } from "https://deno.land/std@0.191.0/testing/asserts.ts";
import {
  consumeEvents,
  consumeNewlines,
  parseEvent,
} from "../../eventSource/helpers.ts";
import { readUrltoText } from "../../utils/mod.ts";
import { readableStreamFromIterable } from "../deps.ts";
import { dataSchema } from "../mod.ts";

const fullFixture = await readUrltoText(
  new URL("./__tests__/fullCompletion.txt", import.meta.url)
);
// const __dirname = new URL(".", import.meta.url).pathname;
// const fullFixture = await Deno.readTextFile(`${__dirname}/fullCompletion.txt`);

function chunkString(s: string) {
  const chunkSize = 100;
  const chunks = [];
  for (let i = 0; i < s.length; i += chunkSize) {
    chunks.push(s.slice(i, i + chunkSize));
  }
  return chunks;
}

Deno.test("Event parsing", async () => {
  let chunkBuffer = "";
  let eventBuffer = [] as string[];
  const chunks = chunkString(fullFixture.trim());
  const body = readableStreamFromIterable(chunks);

  let content = "";
  for await (const chunk of body) {
    chunkBuffer += chunk;
    const { buffer, lines } = consumeNewlines(chunkBuffer);
    chunkBuffer = buffer;
    eventBuffer.push(...lines);

    const { events, buffer: remainingBuffer } = consumeEvents(eventBuffer);
    eventBuffer = remainingBuffer;
    for (const eventInfo of events) {
      const event = parseEvent(eventInfo);
      if (event.data === "[DONE]") {
        console.log("[DONE]");
        break;
      }
      const data = dataSchema.safeParse(JSON.parse(event.data));
      if (!data.success) {
        console.log("data.error", data.error);
        continue;
      }
      const contentDelta = data.data.choices[0].delta.content ?? "";
      content += contentDelta;
    }
  }
  assertEquals(
    content,
    "To master a new language, start with basics and syntax\nPractice and persistence will surely bring success"
  );
});
