import { config } from "./config.ts";

const buffer = new Uint8Array(1024);

const Steps = {
  Options: "options",
  BuildPrompt: "buildPrompt",
  FindPrompt: "findPrompt",
  PromptSelected: "promptSelected",
  Exit: "exit",
} as const;

let step: (typeof Steps)[keyof typeof Steps] = Steps.Options;

while (true) {
  await writeLine("Select an option:");
  await writeLine("a) Build a new prompt");
  await writeLine("b) Find an existing prompt");
  await write("> ");
  const n = <number>await Deno.stdin.read(buffer);
  if (n === null) {
    step = Steps.Exit;
    break;
  }

  const input = new TextDecoder().decode(buffer.subarray(0, n)).trim();
  if (input === "a") {
    step = Steps.BuildPrompt;
    break;
  } else if (input === "b") {
    step = Steps.FindPrompt;
    break;
  } else {
    await writeLine("Invalid input");
    continue;
  }
}

if (step === Steps.BuildPrompt) {
  // There are three steps here.
  const prompt = {
    name: "",
    text: "",
  };
  let promptPath = "";
  while (true) {
    // 1. Name the prompt
    await write("Name the prompt: ");
    const n = <number>await Deno.stdin.read(buffer);
    if (n === null) {
      step = Steps.Exit;
      break;
    }
    prompt.name = new TextDecoder().decode(buffer.subarray(0, n)).trim();
    // Check if there's a naming conflict between config.promptsPath/prompt.name :
    promptPath = `${config.promptsPath}/${prompt.name}.txt`;
    try {
      await Deno.stat(promptPath);
      await writeLine(
        "There's already a prompt with that name. Please choose another name."
      );
      await write("> ");
      continue;
    } catch (error) {
      if (error.name !== "NotFound") {
        console.error(error);
        throw error;
      }
      break;
    }
  }

  while (true) {
    // 2. Write the prompt
    await write("Write the prompt: ");
    const n = <number>await Deno.stdin.read(buffer);
    if (n === null) {
      step = Steps.Exit;
      break;
    }
    prompt.text = new TextDecoder().decode(buffer.subarray(0, n)).trim();
    break;
  }

  if (!promptPath) {
    throw new Error("promptPath is empty");
  }
  await Deno.mkdir(config.promptsPath, { recursive: true });
  await Deno.writeFile(promptPath, new TextEncoder().encode(prompt.text));
  console.log(`Wrote prompt to ${promptPath}`);
  step = Steps.Exit;
}

if (step === Steps.FindPrompt) {
  // List the existing prompts
  const prompts = Deno.readDir(config.promptsPath);
  await writeLine("Select a prompt:");
  const promptMap: Record<number, string> = {};
  let i = 1;
  for await (const entry of prompts) {
    await writeLine(`${i}) ${entry.name}`);
    promptMap[i++] = entry.name;
  }

  const n = <number>await Deno.stdin.read(buffer);
  if (n === null) {
    step = Steps.Exit;
  }
  const input = new TextDecoder().decode(buffer.subarray(0, n)).trim();
  const promptName = promptMap[Number(input)];
  if (!promptName) {
    await writeLine("Invalid input");
    step = Steps.Exit;
  }

  const prompt = await Deno.readTextFile(`${config.promptsPath}/${promptName}`);
  console.log(`Prompt: ${prompt}`);

  // Copy to clipboard using pbcopy
  const success = await copyToClipboard(prompt);
  if (success) {
    console.log(`✅ Copied "${promptName}" to clipboard`);
  } else {
    console.log("❌ Failed to copy to clipboard");
  }

  step = Steps.Exit;
}

if (step === Steps.Exit) {
  Deno.exit(0);
}

async function writeLine(s: string) {
  await write(s + "\n");
}

async function write(s: string) {
  await Deno.stdout.write(new TextEncoder().encode(s));
}

async function copyToClipboard(s: string) {
  const c = new Deno.Command("pbcopy", {
    stdin: "piped",
  });
  const p = c.spawn();
  const writer = p.stdin.getWriter();
  writer.write(new TextEncoder().encode(s));
  writer.close();
  const status = await p.status;
  return status.success;
}
