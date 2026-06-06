/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";
import { DepartureRow } from "./DepartureRow";
import type { Departure } from "../data/mvg";

export function DepartureList({
  deps,
  now,
}: {
  deps: Departure[];
  now: number;
}) {
  if (deps.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.5,
          fontSize: "0.6em",
        }}
      >
        Keine Abfahrten verfügbar.
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridAutoRows: "auto",
        rowGap: "0.1em",
        overflow: "hidden",
        alignContent: "start",
      }}
    >
      {deps.map((d, i) => (
        <DepartureRow key={`${d.line}-${d.time}-${i}`} d={d} now={now} />
      ))}
    </div>
  );
}
