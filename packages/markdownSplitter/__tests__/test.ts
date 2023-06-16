import { join } from "../../deps.ts";
import { splitMarkdownIntoChunks } from "../mod.js";
import { assertSnapshot } from "../../deps.ts";

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
