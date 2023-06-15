import { join } from "https://deno.land/std@0.191.0/path/mod.ts";
import { splitMarkdownIntoChunks } from "./markdownSplitter.ts";
import { assertSnapshot } from "https://deno.land/std@0.191.0/testing/snapshot.ts";

const __dirname = new URL(".", import.meta.url).pathname;

async function createFileIfNotExists(path: string) {
  try {
    await Deno.stat(path);
  } catch (err) {
    if (err.name !== "NotFound") {
      throw err;
    }
    await Deno.create(path);
  }
}

const TEST_DIR = join(__dirname, "files/testSuite");
const testFiles = Deno.readDir(TEST_DIR);
// const TEST_FILES = [
//   // "list",
//   "list2",
// ] as const;

for await (const path of testFiles) {
  Deno.test(path.name, async (t) => {
    const file = await Deno.readTextFile(join(TEST_DIR, path.name));
    const chunks = await splitMarkdownIntoChunks(file);
    await assertSnapshot(t, chunks);
    console.log(chunks);
    console.log(chunks.length);
    // const match = await matchSnapshot(path.name, chunks);
  });
}
