import { iterateReader } from "https://deno.land/std@0.190.0/streams/mod.ts";
// import { iter } from "https://deno.land/std/streams/conversion.ts";
import { OpenAIApi, Configuration } from "./openai.ts";

const configuration = new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

const openai = new OpenAIApi(configuration);
// const content = await Deno.readFile('./files/notes/Workout log.md')
const response = await openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content:
        "Generate me a long poem about how to master a new programming language.",
    },
  ],
});
if (!response.body) {
  throw new Error("response.body is empty");
}

response.body.pipeTo(Deno.stdout.writable);
// const decoder = new TextDecoder();
// const bodyReader = response.body.getReader();
// for await (const chunk of iterateReader(bodyReader)) {
//   console.log(decoder.decode(chunk));
// }
