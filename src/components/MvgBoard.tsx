/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";

import { StationSection } from "./StationSection";
import { DARK_TEXT, FONT_STACK, ensureFont } from "../helpers";
import type { TransportType } from "../data/mvg";

const VALID_TRANSPORT_TYPES = new Set<TransportType>([
  "UBAHN",
  "SBAHN",
  "TRAM",
  "BUS",
  "REGIONAL_BUS",
  "BAHN",
  "SCHIFF",
  "SEV",
]);

export type StopConfig = {
  stop: string;
  transportTypes?: TransportType[];
};

/**
 * Parse the `stops` textarea. One stop per line. Each line is
 * `<stop>[;<TYPE>,<TYPE>,…]` — types filter the departures shown for that
 * stop. `<stop>` can be a free-text name or a `de:NNN:NNN` global station
 * ID; both are resolved via `findStation` so we get the official name.
 */
function parseStops(raw: unknown): StopConfig[] {
  const text = String(raw ?? "");
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const result: StopConfig[] = [];
  for (const line of lines) {
    const semi = line.indexOf(";");
    if (semi === -1) {
      result.push({ stop: line });
      continue;
    }
    const stop = line.slice(0, semi).trim();
    if (!stop) continue;
    const types = line
      .slice(semi + 1)
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter((t): t is TransportType =>
        VALID_TRANSPORT_TYPES.has(t as TransportType),
      );
    result.push({
      stop,
      transportTypes: types.length > 0 ? types : undefined,
    });
  }

  return result.length > 0 ? result : [{ stop: "Universität" }];
}

export function MvgBoard({ ctx }: { ctx: MagicFrameCtx }) {
  const { useState, useEffect, useMemo } = ctx;

  // Memoized so the parsed array refs stay stable across "now" ticks —
  // otherwise StationSection's useEffect for the departures poll would fire
  // every 15 s and re-fetch.
  const stops = useMemo(
    () => parseStops(ctx.config.stops),
    [ctx.config.stops],
  );
  const limit = Math.max(1, Number(ctx.config.limit) || 8);
  const offset = Math.max(0, Number(ctx.config.offsetMinutes) || 0);

  // Single "now" tick shared by every section so all minute counters update
  // in lockstep without each section running its own timer.
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    ensureFont();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#fff",
        color: DARK_TEXT,
        fontFamily: FONT_STACK,
        padding: "0.45em 0.6em",
        boxSizing: "border-box",
        // Grid with `alignContent: center` keeps each section at its natural
        // height (no flex stretching) but vertically centers the whole stack
        // inside the widget.
        display: "grid",
        gridAutoRows: "auto",
        alignContent: "center",
        rowGap: "0.6em",
      }}
    >
      {stops.map((cfg, i) => (
        <StationSection
          key={`${i}-${cfg.stop}`}
          ctx={ctx}
          stop={cfg.stop}
          transportTypes={cfg.transportTypes}
          limit={limit}
          offset={offset}
          now={now}
        />
      ))}
    </div>
  );
}
