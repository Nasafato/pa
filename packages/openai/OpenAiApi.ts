import { Configuration } from "./Configuration.ts";
import {
  consumeEvents,
  consumeNewlines,
  parseEvent,
} from "../eventSource/helpers.ts";
import { z } from "../deps.ts";

export const API_URL = "https://api.openai.com/v1";

export class OpenAIApi {
  configuration: Configuration;
  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  async createChatCompletion(config: {
    model: string;
    messages: { role: string; content: string }[];
  }) {
    const response = await this.request("/chat/completions", {
      model: config.model,
      messages: config.messages,
      stream: true,
    });

    if (!response.body) {
      throw new Error("response.body is empty");
    }

    return response;
  }

  async request(path: string, body: any) {
    const apiKey = this.configuration.apiKey;
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    return response;
  }
}

export const choiceSchema = z.object({
  delta: z.object({
    role: z.string().optional(),
    content: z.string().optional(),
  }),
  index: z.number(),
  finish_reason: z.string().nullable(),
});

export const dataSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(choiceSchema),
});

export async function streamBody(
  body: ReadableStream<Uint8Array>,
  handleEvent: (event: { name: string; data: string }) => boolean
) {
  const decoder = new TextDecoder();
  let chunkBuffer = "";
  let eventBuffer = [] as string[];

  for await (const chunk of body) {
    chunkBuffer += decoder.decode(chunk);
    const { buffer, lines } = consumeNewlines(chunkBuffer);
    chunkBuffer = buffer;
    eventBuffer.push(...lines);

    const { events, buffer: remainingBuffer } = consumeEvents(eventBuffer);
    eventBuffer = remainingBuffer;
    for (const eventInfo of events) {
      const event = parseEvent(eventInfo);
      const done = handleEvent(event);
      if (done) {
        break;
      }
    }
  }
}
