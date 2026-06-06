/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";
import { Badge } from "./Badge";
import { SystemIcon } from "./SystemIcon";
import type { Departure } from "../data/mvg";
import {
  DARK_TEXT,
  SYSTEM_BADGES,
  SYSTEM_ICONS,
  lineBadgeColor,
  minutesUntil,
} from "../helpers";

export function DepartureRow({ d, now }: { d: Departure; now: number }) {
  const mins = minutesUntil(d.time, now);
  const delayed = d.realtime && (d.delay ?? 0) > 0;
  // Rail-replacement: API tags these as the substitute vehicle (e.g. BUS) but
  // with `sev: true`. Show the SEV system badge regardless of the carrier
  // and keep the original line label/colour ("U6" stays U-Bahn blue).
  const systemType = d.sev ? "SEV" : d.transportType;
  const iconSrc = SYSTEM_ICONS[systemType];
  const sys = SYSTEM_BADGES[systemType];
  const line = lineBadgeColor(d.line, d.transportType);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.5em 2.4em 1fr auto",
        alignItems: "center",
        columnGap: "0.4em",
        fontSize: "0.7em",
        padding: "0.15em 0",
        opacity: d.cancelled ? 0.45 : 1,
      }}
    >
      <SystemIcon iconSrc={iconSrc} fallback={sys} />
      <Badge
        text={d.line}
        bg={line.bg}
        fg={line.fg}
        pill={false}
        weight={800}
      />
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textDecoration: d.cancelled ? "line-through" : undefined,
          fontWeight: 700,
          color: DARK_TEXT,
        }}
        title={d.destination}
      >
        {d.destination}
      </span>
      <span
        style={{
          textAlign: "right",
          fontWeight: 700,
          // fontVariantNumeric: "tabular-nums",
          color: d.cancelled ? "#a33" : delayed ? "#c40c0c" : DARK_TEXT,
          paddingLeft: "0.5em",
        }}
      >
        {d.cancelled ? "—" : mins}
      </span>
    </div>
  );
}
