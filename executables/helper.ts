import { load } from "https://deno.land/std@0.192.0/dotenv/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import {
  OpenAIApi,
  Configuration,
  streamBody,
} from "../packages/openai/mod.ts";
// await load({
//   export: true,
// });

// const configuration = new Configuration({
//   apiKey: Deno.env.get("OPENAI_API_KEY") || "",
// });

// const openai = new OpenAIApi(configuration);
// // const content = await Deno.readFile('./files/notes/Workout log.md')
// const response = await openai.createChatCompletion({
//   model: "gpt-3.5-turbo",
//   messages: [
//     {
//       role: "user",
//       content:
//         "Generate me a two line poem about how to master a new programming language.",
//     },
//   ],
// });
// if (!response.body) {
//   throw new Error("response.body is empty");
// }

const file = await Deno.open("./testoutput.txt", { read: true });
await streamBody(file.readable);

// for await (const chunk of response.body) {
//   console.log("chunk", decoder.decode(chunk));
// }

// response.body.pipeTo(Deno.stdout.writable);
// const file = await Deno.open("./output.txt", { write: true, create: true });
// await response.body.pipeTo(file.writable);
// const decoder = new TextDecoder();
// const bodyReader = response.body.getReader();
// for await (const chunk of iterateReader(bodyReader)) {
//   console.log(decoder.decode(chunk));
// }
