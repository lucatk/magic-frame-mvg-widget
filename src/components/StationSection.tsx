/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";

import {
  departures,
  findStation,
  type Departure,
  type Station,
  type TransportType,
} from "../data/mvg";
import type { Theme } from "../themes";

export function StationSection({
  ctx,
  stop,
  transportTypes,
  limit,
  offset,
  now,
  theme,
  refreshTick,
}: {
  ctx: MagicFrameCtx;
  stop: string;
  transportTypes?: TransportType[];
  limit: number;
  offset: number;
  now: number;
  theme: Theme;
  /** Increments whenever MvgBoard wants every station to re-fetch. */
  refreshTick: number;
}) {
  const { useState, useEffect } = ctx;

  const [station, setStation] = useState<Station | null>(null);
  const [deps, setDeps] = useState<Departure[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Resolve station whenever this section's `stop` text changes.
  useEffect(() => {
    const ac = new AbortController();
    setError(null);
    setStation(null);
    findStation(stop, { fetch: ctx.fetch, signal: ac.signal })
      .then((s) => {
        if (ac.signal.aborted) return;
        if (!s) setError(`Haltestelle "${stop}" nicht gefunden.`);
        else setStation(s);
      })
      .catch((e: unknown) => {
        if (ac.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => ac.abort();
  }, [stop]);

  // Serialize transport types into a stable string for the deps array —
  // array refs would change every parent render and re-fire the effect.
  const typesKey = transportTypes ? transportTypes.join(",") : "";

  // Re-fetch whenever the board's shared refresh tick increments (or when
  // any of the request shape changes). No per-section interval — the
  // schedule lives in MvgBoard so a single RefreshIndicator there can be
  // accurately coupled to the actual fetch cadence.
  useEffect(() => {
    if (!station) return;
    const ac = new AbortController();
    (async () => {
      try {
        const list = await departures(station.id, {
          limit,
          offsetInMinutes: offset,
          transportTypes,
          fetch: ctx.fetch,
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        setDeps(list);
        setError(null);
      } catch (e: unknown) {
        if (ac.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => ac.abort();
  }, [station?.id, limit, offset, typesKey, refreshTick]);

  const title = station?.name || stop;
  const subtitle = station?.place || undefined;
  const loading = !station && !error;

  return (
    <theme.Section
      title={title}
      subtitle={subtitle}
      deps={deps}
      now={now}
      error={error}
      loading={loading}
      limit={limit}
    />
  );
}
