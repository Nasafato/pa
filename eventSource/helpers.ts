export interface NewLinesResponse {
  lines: string[];
  buffer: string;
}

export function consumeNewlines(buffer: string): NewLinesResponse {
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
