import { join } from "https://deno.land/std@0.191.0/path/mod.ts";
import { splitMarkdownIntoChunks } from "./markdownSplitter.js";
import { assertSnapshot } from "https://deno.land/std@0.191.0/testing/snapshot.ts";

const __dirname = new URL(".", import.meta.url).pathname;

const TEST_DIR = join(__dirname, "files/testSuite");
const testFiles = Deno.readDir(TEST_DIR);

for await (const path of testFiles) {
  Deno.test(path.name, async (t) => {
    // if (path.name !== "hyperlink.md") {
    //   return;
    // }
    const file = await Deno.readTextFile(join(TEST_DIR, path.name));
    const chunks = splitMarkdownIntoChunks(file);
    await assertSnapshot(t, chunks);
  });
}
