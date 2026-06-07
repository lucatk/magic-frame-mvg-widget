/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";

import { StationSection } from "./StationSection";
import { resolveTheme } from "../themes";
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

const REFRESH_MIN_S = 30;
const REFRESH_MAX_S = 300;
const REFRESH_DEFAULT_S = 60;

function resolveRefreshMs(raw: unknown): number {
  const n = Number(raw);
  const sec = Number.isFinite(n) && n > 0 ? n : REFRESH_DEFAULT_S;
  return Math.min(REFRESH_MAX_S, Math.max(REFRESH_MIN_S, sec)) * 1000;
}

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

  const stops = useMemo(
    () => parseStops(ctx.config.stops),
    [ctx.config.stops],
  );
  const limit = Math.max(1, Number(ctx.config.limit) || 8);
  const offset = Math.max(0, Number(ctx.config.offsetMinutes) || 0);
  const theme = useMemo(() => resolveTheme(ctx.config.theme), [ctx.config.theme]);
  const boxPadding = ctx.config.boxPadding !== false;
  const showRefreshIndicator = ctx.config.refreshIndicator === true;
  const refreshMs = resolveRefreshMs(ctx.config.refreshSeconds);

  // Single "now" tick shared by every section so all minute counters update
  // in lockstep without each section running its own timer.
  const [now, setNow] = useState<number>(() => Date.now());

  // Shared refresh tick — increments every REFRESH_INTERVAL_MS to drive a
  // synchronized re-fetch across every StationSection. The RefreshIndicator
  // is keyed on this tick so its CSS animation restarts exactly when the
  // fetches do.
  const [refreshTick, setRefreshTick] = useState<number>(0);

  useEffect(() => {
    theme.onMount?.();
  }, [theme.name]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => setRefreshTick((t) => t + 1),
      refreshMs,
    );
    return () => window.clearInterval(id);
  }, [refreshMs]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        padding: boxPadding ? "0.45em 0.6em" : 0,
        boxSizing: "border-box",
        display: "grid",
        gridAutoRows: "auto",
        alignContent: "center",
        rowGap: "0.6em",
        ...theme.boardStyle,
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
          theme={theme}
          refreshTick={refreshTick}
        />
      ))}
      {showRefreshIndicator ? (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "-0.4em",
          }}
        >
          <ProgressRing
            key={refreshTick}
            ctx={ctx}
            durationMs={refreshMs}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Progress ring copied verbatim from magic-frame's wallpaper engine. Starts
 * fully drawn at mount, then animates `stroke-dashoffset` from 0 to its
 * full circumference (i.e. drains away) over `durationMs`. The parent
 * gives this a new `key` on each shared refresh tick so React remounts it
 * and the depletion restarts in sync with the re-fetch.
 */
function ProgressRing({
  ctx,
  durationMs,
}: {
  ctx: MagicFrameCtx;
  durationMs: number;
}) {
  const { useState, useEffect } = ctx;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);
  const circumference = 2 * Math.PI * 40;
  return (
    <div className="w-3.5 h-3.5 drop-shadow-md">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="40"
          className="stroke-white/30"
          strokeWidth="16"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          className="stroke-white"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: ready ? circumference : 0,
            transition: `stroke-dashoffset ${durationMs}ms linear`,
          }}
        />
      </svg>
    </div>
  );
}
