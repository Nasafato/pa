import { assertEquals } from "https://deno.land/std@0.191.0/testing/asserts.ts";

interface Return {
  lines: string[];
  buffer: string;
}

export function consumeNewlines(buffer: string): Return {
  const lines = [];
  let i = -1;
  let j = 0;
  while (j < buffer.length) {
    const char = buffer[j];
    if (char === "\n") {
      lines.push(buffer.slice(Math.max(0, i), j + 1).trim());
      i = j;
    }
    j++;
  }

  return {
    lines: lines,
    buffer: buffer.slice(i + 1),
  };
}
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

export interface EventInfo {
  lines: string[];
}

export function consumeEvents(buffer: string[]): {
  events: EventInfo[];
  buffer: string[];
} {
  const events: EventInfo[] = [];
  let i = 0;
  let remainingBuffer = buffer;
  for (let j = 0; j < buffer.length; j++) {
    const line = buffer[j];
    if (line === "") {
      events.push({
        lines: buffer.slice(i, j),
      });
      remainingBuffer = buffer.slice(j + 1);
      i = j + 1;
    }
  }

  return {
    events,
    buffer: remainingBuffer,
  };
}

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
