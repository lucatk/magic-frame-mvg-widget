/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";

import { Header } from "./Header";
import { DepartureList } from "./DepartureList";
import {
  departures,
  findStation,
  type Departure,
  type Station,
  type TransportType,
} from "../data/mvg";

export function StationSection({
  ctx,
  stop,
  transportTypes,
  limit,
  offset,
  now,
}: {
  ctx: MagicFrameCtx;
  stop: string;
  transportTypes?: TransportType[];
  limit: number;
  offset: number;
  now: number;
}) {
  const { useState, useEffect } = ctx;

  const [station, setStation] = useState<Station | null>(null);
  const [deps, setDeps] = useState<Departure[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Resolve station whenever this section's `stop` text changes.
  // `findStation` accepts either a free-text query or a global station ID
  // and routes the lookup to the right endpoint internally.
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

  // Poll departures every 60s while station is known.
  useEffect(() => {
    if (!station) return;
    const ac = new AbortController();
    const tick = async () => {
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
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => {
      ac.abort();
      window.clearInterval(id);
    };
  }, [station?.id, limit, offset, typesKey]);

  const title = station?.name || stop;
  // const subtitle = station?.place || undefined;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "auto auto",
        rowGap: "0.25em",
      }}
    >
      <Header title={title} />
      {error ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b00020",
            fontSize: "0.6em",
            textAlign: "center",
            padding: "0.4em",
          }}
        >
          ⚠ {error}
        </div>
      ) : !station ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.5,
            fontSize: "0.6em",
          }}
        >
          Lade…
        </div>
      ) : (
        <DepartureList deps={deps.slice(0, limit)} now={now} />
      )}
    </div>
  );
}
