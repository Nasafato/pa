import { assertEquals } from "https://deno.land/std@0.191.0/testing/asserts.ts";
import { consumeEvents, consumeNewlines } from "../helpers.ts";

Deno.test("consumeNewlines", async (t) => {
  await t.step("empty buffer", () => {
    assertEquals(consumeNewlines(""), {
      lines: [],
      buffer: "",
    });
  });

  await t.step("single character", () => {
    assertEquals(consumeNewlines("a"), {
      lines: [],
      buffer: "a",
    });
    assertEquals(consumeNewlines("ab"), {
      lines: [],
      buffer: "ab",
    });
  });

  await t.step("single newline", () => {
    assertEquals(consumeNewlines("\n"), {
      lines: [""],
      buffer: "",
    });
    assertEquals(consumeNewlines("\n\n"), {
      lines: ["", ""],
      buffer: "",
    });
  });

  await t.step("single character and newline", () => {
    assertEquals(consumeNewlines("a\n"), {
      lines: ["a"],
      buffer: "",
    });
  });

  await t.step("multiple characters and newline", () => {
    assertEquals(consumeNewlines("a\nb"), {
      lines: ["a"],
      buffer: "b",
    });
  });

  await t.step("single character and multiple newlines", () => {
    assertEquals(consumeNewlines("a\n\n"), {
      lines: ["a", ""],
      buffer: "",
    });
  });

  await t.step("multiple characters and multiple newlines", () => {
    assertEquals(consumeNewlines("a\n\nb"), {
      lines: ["a", ""],
      buffer: "b",
    });
  });
});

Deno.test("parseEvent", async (t) => {
  await t.step("a", () => {
    assertEquals(consumeEvents(["a"]), {
      events: [],
      buffer: ["a"],
    });
  });

  await t.step("a\\n", () => {
    assertEquals(consumeEvents(["a", ""]), {
      events: [{ lines: ["a"] }],
      buffer: [],
    });
  });

  await t.step("a\\nb", () => {
    assertEquals(consumeEvents(["a", "", "b"]), {
      events: [{ lines: ["a"] }],
      buffer: ["b"],
    });
  });

  await t.step("a\\n\\nb\\n\\n", () => {
    assertEquals(consumeEvents(["a", "", "b", ""]), {
      events: [{ lines: ["a"] }, { lines: ["b"] }],
      buffer: [],
    });
  });
});
