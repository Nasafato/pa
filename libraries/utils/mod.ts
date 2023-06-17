import {
  readAll,
  readerFromStreamReader,
} from "https://deno.land/std@0.192.0/streams/mod.ts";

export async function createFileIfNotExists(path: string) {
  try {
    await Deno.stat(path);
  } catch (err) {
    if (err.name !== "NotFound") {
      throw err;
    }
    await Deno.create(path);
  }
}

export async function readUrltoText(url: string | URL) {
  const stream = await urlToStream(url);
  const decoder = new TextDecoder();
  const buffer = await readAll(readerFromStreamReader(stream.getReader()));
  return decoder.decode(buffer);
}

export async function urlToStream(url: string | URL) {
  url = stringToUrl(url);
  if (url.protocol === "file:") {
    return (await Deno.open(url)).readable;
  }

  const res = await fetch(url);
  if (!res.body) {
    throw new Error("Failed to fetch");
  }
  return res.body;
}

export function stringToUrl(s: string | URL) {
  if (typeof s === "string") {
    s = new URL(s);
  }
  return s;
}
