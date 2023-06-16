import { unified } from "npm:unified@10.1.2";
import remarkParse from "https://esm.sh/remark-parse@10.0.2";

export function splitMarkdownIntoChunks(markdown) {
  const ast = unified().use(remarkParse).parse(markdown);
  const chunks = [];
  let currentChunk = [];

  const finishChunk = () => {
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n"));
      currentChunk = [];
    }
  };

  const visitList = (node, accumulator) => {
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

  const visit = (node) => {
    switch (node.type) {
      case "root": {
        node.children.forEach(visit);
        break;
      }
      case "heading": {
        finishChunk();
        // console.log(node.children);
        const depth = node.depth;
        const heading = Array(depth).fill("#").join("");
        const chunk = [heading, " ", ...node.children.map((c) => c.value)].join(
          ""
        );
        currentChunk.push(chunk);
        break;
      }
      case "link": {
        finishChunk();
        const accumulator = [];
        visitLink(node, accumulator);
        currentChunk.push(accumulator.join(" "));
        break;
      }
      case "code":
        finishChunk();
        currentChunk.push(node.value);
        break;
      case "list": {
        finishChunk();
        const accumulator = [];
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

  const visitLink = (node, accumulator) => {
    switch (node.type) {
      case "link":
        node.children.forEach((c) => visitLink(c, accumulator));
        accumulator.push(node.url);
        break;
      case "text":
        accumulator.push(node.value);
    }
  };

  visit(ast);
  finishChunk();
  return chunks;
}
