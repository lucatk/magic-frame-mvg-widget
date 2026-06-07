/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";

import {
  SYSTEM_BADGES,
  SYSTEM_ICONS,
  lineBadgeColor,
  minutesUntil,
  type SystemBadgeStyle,
} from "../helpers";
import type { Departure } from "../data/mvg";
import type { SectionProps, Theme } from "./index";

// "In-Vehicle Fahrgastinformation" look: white background, navy text,
// Atkinson Hyperlegible, thin black header rules above and below the title.

const FONT_STACK =
  '"Atkinson Hyperlegible", "Helvetica Neue", Helvetica, Arial, sans-serif';
const TEXT = "#0d2a5b";
const MUTED = "#3c3c3c";
const RULE = "#1a1a1a";

function ensureFont(): void {
  if (typeof document === "undefined") return;
  const id = "magic-frame-mvg-atkinson";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap";
  document.head.appendChild(link);
}

function Header({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "end",
        borderTop: `1px solid ${RULE}`,
        borderBottom: `1px solid ${RULE}`,
        padding: "0.2em 0",
        columnGap: "1em",
      }}
    >
      <div style={{ lineHeight: 1.1 }}>
        <span style={{ fontWeight: 700, fontSize: "0.9em" }}>{title}</span>
      </div>
      <div style={{ textAlign: "right", lineHeight: 1.1 }}>
        <div style={{ fontWeight: 700, fontSize: "0.6em" }}>
          Abfahrt in min.
        </div>
        <div style={{ fontWeight: 400, fontSize: "0.5em", color: MUTED }}>
          departure in mins.
        </div>
      </div>
    </div>
  );
}

function Badge({
  text,
  bg,
  fg,
  pill,
}: {
  text: string;
  bg: string;
  fg: string;
  pill: boolean;
}) {
  const sizeEm = text.length >= 4 ? 0.7 : text.length === 3 ? 0.8 : 0.9;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color: fg,
        height: "1.5em",
        minWidth: "1.5em",
        padding: pill ? "0 0.55em" : "0 0.3em",
        borderRadius: pill ? "0.9em" : "0.18em",
        fontWeight: 800,
        fontSize: `${sizeEm}em`,
        letterSpacing: "0.01em",
        lineHeight: 1,
        justifySelf: "start",
      }}
    >
      {text}
    </span>
  );
}

function SystemIcon({
  iconSrc,
  fallback,
}: {
  iconSrc: string | undefined;
  fallback: SystemBadgeStyle | undefined;
}) {
  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt=""
        style={{
          width: "1.5em",
          height: "1.5em",
          display: "block",
          justifySelf: "start",
        }}
      />
    );
  }
  if (!fallback) return <span />;
  return (
    <Badge
      text={fallback.label}
      bg={fallback.bg}
      fg={fallback.fg}
      pill={fallback.pill}
    />
  );
}

function Row({ d, now }: { d: Departure; now: number }) {
  const mins = minutesUntil(d.time, now);
  const delayed = d.realtime && (d.delay ?? 0) > 0;
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
      <Badge text={d.line} bg={line.bg} fg={line.fg} pill={false} />
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textDecoration: d.cancelled ? "line-through" : undefined,
          fontWeight: 700,
          color: TEXT,
        }}
        title={d.destination}
      >
        {d.destination}
      </span>
      <span
        style={{
          textAlign: "right",
          fontWeight: 700,
          color: d.cancelled ? "#a33" : delayed ? "#c40c0c" : TEXT,
          paddingLeft: "0.5em",
        }}
      >
        {d.cancelled ? "—" : mins}
      </span>
    </div>
  );
}

function Section(props: SectionProps) {
  const { title, deps, now, error, loading, limit } = props;
  const list = deps.slice(0, limit);
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
      ) : loading ? (
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
      ) : list.length === 0 ? (
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
      ) : (
        <div
          style={{
            display: "grid",
            gridAutoRows: "auto",
            rowGap: "0.1em",
            overflow: "hidden",
            alignContent: "start",
          }}
        >
          {list.map((d, i) => (
            <Row key={`${d.line}-${d.time}-${i}`} d={d} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

export const lightVehicle: Theme = {
  name: "lightVehicle",
  label: "Fahrzeug (hell)",
  Section,
  boardStyle: {
    background: "#fff",
    color: TEXT,
    fontFamily: FONT_STACK,
  },
  onMount: ensureFont,
};
