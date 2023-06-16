export const API_URL = "https://api.openai.com/v1";
// import { OpenAIApi, Configuration } from "npm:openai@3.3.0";

// const apiKey = Deno.env.get("OPENAI_API_KEY");
// if (!apiKey) {
//   throw new Error("OPENAI_API_KEY is not set");
// }
// const configuration = new Configuration({
//   apiKey,
// });

// const openai = new OpenAIApi(configuration);
// const chatCompletion = await openai.createChatCompletion({
//   model: "gpt-3.5-turbo",
//   messages: [{ role: "user", content: "Hello world" }],
// });
// console.log(chatCompletion.data.choices[0].message);

// export async function query(question: string) {}

export class Configuration {
  apiKey: string;
  constructor(config: { apiKey: string }) {
    if (!config.apiKey) {
      throw new Error("apiKey is not set");
    }
    this.apiKey = config.apiKey;
  }
}

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

    // const body = await readAll(response.body);
    // console.log(decoder.decode(body));
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
