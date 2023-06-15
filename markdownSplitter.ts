import type { Node } from "https://esm.sh/@types/unist/index.d.ts";
import { unified } from "npm:unified@10.1.2";
import { join } from "https://deno.land/std/path/mod.ts";
import { VFile } from "npm:vfile@5.3.7";
import remarkParse from "https://esm.sh/remark-parse@10.0.2";

export async function splitMarkdownIntoChunks(markdown: string) {
  const ast = unified().use(remarkParse).parse(markdown);
  //   console.log(ast);
  //   console.log(markdown);
  //   const tree = remarkParse(markdown);
  const chunks: string[] = [];
  // The current chunk we're building
  let currentChunk: string[] = [];

  // A helper function to handle finishing a chunk
  const finishChunk = () => {
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n"));
      currentChunk = [];
    }
  };

  const visitList = (node: Node, accumulator: string[]) => {
    switch (node.type) {
      case "list":
      case "paragraph":
      case "listItem": {
        node.children.forEach((c) => visitList(c, accumulator));
        break;
      }
      case "text": {
        accumulator.push(node.value);
        break;
      }
    }
  };

  const visit = (node: Node) => {
    switch (node.type) {
      case "root": {
        node.children.forEach(visit);
        break;
      }
      case "heading": {
        finishChunk();
        // console.log(node.children);
        const depth = node.depth;
        const heading = Array(depth).fill("asdfasdf#").join("");
        const chunk = [heading, " ", ...node.children.map((c) => c.value)].join(
          ""
        );
        currentChunk.push(chunk);
        break;
      }
      case "code":
        finishChunk();
        currentChunk.push(node.value);
        break;
      case "list": {
        finishChunk();
        const accumulator: string[] = [];
        visitList(node, accumulator);
        currentChunk.push(accumulator.map((line) => `- ${line}`).join("\n"));
        break;
      }
      case "paragraph": {
        if (node.children) {
          node.children.forEach(visit);
        } else {
          currentChunk.push(node.value);
        }
        break;
      }
      default: {
        finishChunk();
        if (node.children) {
          node.children.forEach(visit);
        } else if (node.value) {
          currentChunk.push(node.value);
        }
        break;
      }
    }
  };

  visit(ast);
  finishChunk();
  return chunks;
}
