import { load } from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { generateCompletion } from "./completion.ts";

await load({
  export: true,
});

if (import.meta.main) {
  const configuration = new Configuration({
    apiKey: Deno.env.get("OPENAI_API_KEY") || "",
  });

  const openai = new OpenAIApi(configuration);
  const query = Deno.args.join(" ");

  if (query.length === 0) {
    throw new Error("Query is empty");
  }

  await generateCompletion(
    openai,
    `Act as a highly knowledgeable individual. Answer the following query, while being concise, thorough, and helpful: ${query}`
  );
}
