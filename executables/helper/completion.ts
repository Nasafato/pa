import { OpenAIApi, dataSchema, streamBody } from "openai";

export async function generateCompletion(openai: OpenAIApi, message: string) {
  console.log("Sending message:", message);
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  });
  if (!response.body) {
    throw new Error("response.body is empty");
  }
  let content = "";

  await streamBody(response.body, (event) => {
    if (event.data === "[DONE]") {
      return true;
    }
    const data = dataSchema.safeParse(JSON.parse(event.data));
    if (!data.success) {
      console.log("data.error", data.error);
      return false;
    }
    const contentDelta = data.data.choices[0].delta.content ?? "";
    if (contentDelta === "") {
      return false;
    }
    Deno.stdout.writeSync(new TextEncoder().encode(contentDelta));
    content += contentDelta;
    return false;
  });
  Deno.stdout.writeSync(new TextEncoder().encode("\n"));
}
