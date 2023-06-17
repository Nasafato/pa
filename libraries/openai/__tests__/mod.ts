import { readUrltoText, assertEquals } from "../devDeps.ts";
import {
  readableStreamFromIterable,
  consumeEvents,
  consumeNewlines,
  parseEvent,
} from "../deps.ts";
import { dataSchema } from "../mod.ts";

const completionTxtUrl = new URL("./fullCompletion.txt", import.meta.url);
const fullFixture = await readUrltoText(completionTxtUrl);

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
