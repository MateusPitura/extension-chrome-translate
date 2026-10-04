import { hash } from ".";
import type { Message } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

// "[10/2, 15:32] John Doe: text" -> [Month/Day, HH:MM] (year and seconds optional)
const HEADER_REGEX =
  /^\[(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?,\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*([^:\n]+?):\s?(.*)$/;

// Any line that starts like a WhatsApp stamp (e.g. system messages without "Name:")
const STAMP_REGEX = /^\[\d{1,2}\/\d{1,2}(?:\/\d{2,4})?,\s*\d{1,2}:\d{2}/;

interface Draft {
  timestamp: number;
  name: string;
  lines: string[];
}

function toTimestamp(
  month: number,
  day: number,
  year: number | undefined,
  hour: number,
  minute: number,
  second: number,
  now: Date,
): number | null {
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }
  const fullYear =
    year === undefined ? now.getFullYear() : year < 100 ? 2000 + year : year;
  let date = new Date(fullYear, month - 1, day, hour, minute, second);
  // No year in the stamp and the date lands in the future: it belongs to last year.
  if (year === undefined && date.getTime() > now.getTime() + DAY_MS) {
    date = new Date(fullYear - 1, month - 1, day, hour, minute, second);
  }
  return date.getTime();
}

/**
 * Extracts messages from copied WhatsApp text. Text without the "[date, time] Name:" header
 * (e.g. a single copied message) is ignored. Lines without a header continue the previous message.
 */
export function parseWhatsAppChat(raw: string, now = new Date()): Message[] {
  const drafts: Draft[] = [];
  let current: Draft | null = null;

  for (const rawLine of raw.split(/\r?\n/)) {
    // WhatsApp inserts invisible direction marks (LRM/RLM) in copied text
    const line = rawLine.replace(/[\u200e\u200f]/g, "");
    const match = HEADER_REGEX.exec(line);

    if (!match) {
      if (STAMP_REGEX.test(line))
        current = null; // stamped line without sender: system message
      else if (current) current.lines.push(line);
      continue;
    }

    const [, month, day, year, hour, minute, second, name, text] = match;
    const timestamp = toTimestamp(
      Number(month),
      Number(day),
      year ? Number(year) : undefined,
      Number(hour),
      Number(minute),
      second ? Number(second) : 0,
      now,
    );
    if (timestamp === null) {
      current = null;
      continue;
    }
    current = { timestamp, name: name.trim(), lines: [text] };
    drafts.push(current);
  }

  // Identical messages (same minute, sender and text) inside one paste get an occurrence index,
  // so re-pasting the same chunk yields the same ids and is ignored.
  const occurrences = new Map<string, number>();
  const messages: Message[] = [];
  for (const draft of drafts) {
    const text = draft.lines.join("\n").trim();
    if (!text) continue;
    const base = `${draft.timestamp}|${draft.name}|${text}`;
    const n = occurrences.get(base) ?? 0;
    occurrences.set(base, n + 1);
    messages.push({
      id: hash(`${base}#${n}`),
      timestamp: draft.timestamp,
      sender: { onlyName: draft.name },
      text,
    });
  }
  return messages;
}
