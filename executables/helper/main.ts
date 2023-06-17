import { load } from "dotenv";
import { Configuration, OpenAIApi, encode } from "openai";
import { generateCompletion } from "./completion.ts";

await load({
  export: true,
});

const __dirname = new URL(".", import.meta.url).pathname;
const configuration = new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

const openai = new OpenAIApi(configuration);

// const content = await Deno.readTextFile(
// join(__dirname, "../../files/notes/Workout Log.md")
// join(__dirname, "../../files/notes/one-week-log.md")
// );

const query = Deno.args.join(" ");

// const output = encode(content);
// console.log(`Estimated tokens: ${output.length}`);

if (query.length === 0) {
  throw new Error("Query is empty");
}

await generateCompletion(
  openai,
  `Act as a highly knowledgeable individual. Answer the following query, while being concise, thorough, and helpful: ${query}`
);
