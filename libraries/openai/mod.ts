import { join } from "../deps.ts";
import { OpenAIApi, streamBody, dataSchema } from "./OpenAiApi.ts";
import { encode, decode } from "./encoder.ts";
import { Configuration } from "./Configuration.ts";

const __dirname = new URL(".", import.meta.url).pathname;
// const fullFixture = await Deno.open(
//   join(__dirname, "__tests__/fullCompletion.txt")
// );
export {
  OpenAIApi,
  Configuration,
  // fullFixture,
  encode,
  decode,
  streamBody,
  dataSchema,
};
