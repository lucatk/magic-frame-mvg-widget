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
import type { Departure, TransportType } from "../data/mvg";
import type { SectionProps, Theme } from "./index";

// Station-board variant of the UBAHN badge: same blue + white "U" letterform,
// but with sharp square corners (the original SVG has rounded corners baked
// into the outer rect path).
const UBAHN_SHARP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill="#2A63A9" d="M0 0h16v16H0z"/><path fill="#fff" d="M8 13.5c-1.3 0-2.7-.3-3.5-1.5-.7-1-.9-2.1-.9-3.3V2.5h2.7v7c0 .7.2 1.5.9 1.8.6.2 1.5.1 1.9-.5.5-.9.4-1.9.4-2.8V2.5h2.7v7.3c0 1.3-.6 2.8-1.9 3.4-.6.2-1.4.3-2.3.3"/></svg>`;
const UBAHN_SHARP_URL = `data:image/svg+xml;utf8,${encodeURIComponent(UBAHN_SHARP_SVG)}`;

function iconFor(t: TransportType): string | undefined {
  if (t === "UBAHN") return UBAHN_SHARP_URL;
  return SYSTEM_ICONS[t];
}

// "Bahnhof Abfahrtsanzeige" look: transparent background (host's black
// shows through), white text, sharp rectangular badges — no rounding, no
// SVG marketing icons. Typography leans heavier and tighter than the
// in-vehicle Fahrgastinformation theme.

const FONT_STACK =
  '"Helvetica Neue", "Inter", "Arial Narrow", Arial, system-ui, sans-serif';
const TEXT = "#fff";
const RULE = "#fff";
const BADGE_BORDER = "1px solid #fff";

function Header({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        borderBottom: `1px solid ${RULE}`,
        padding: "0.15em 0",
        columnGap: "1em",
        lineHeight: 1,
      }}
    >
      <span style={{ fontWeight: 600 }}>{title}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>
        Abfahrt in Min.
      </span>
    </div>
  );
}

function Badge({
  text,
  bg,
  fg,
}: {
  text: string;
  bg: string;
  fg: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color: fg,
        // Height equals 1em so the badge's top/bottom edges line up with
        // the text edges around it (Row sets lineHeight: 1).
        height: "1em",
        minWidth: "1.7em",
        padding: "0 0.2em",
        borderRadius: 0,
        border: BADGE_BORDER,
        boxSizing: "border-box",
        fontWeight: 700,
        letterSpacing: "0.02em",
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
  // System badge keeps its native MVG marketing shape (rounded square /
  // circle / hexagon). To outline the actual shape (not a square wrapper),
  // stack four sharp drop-shadows — they follow the SVG's alpha channel so
  // the white border hugs whatever curve the icon defines.
  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt=""
        style={{
          width: "1em",
          height: "1em",
          display: "block",
          justifySelf: "start",
          filter:
            "drop-shadow(1px 0 0 #fff) drop-shadow(-1px 0 0 #fff) drop-shadow(0 1px 0 #fff) drop-shadow(0 -1px 0 #fff)",
        }}
      />
    );
  }
  if (!fallback) return <span />;
  return <Badge text={fallback.label} bg={fallback.bg} fg={fallback.fg} />;
}

function Row({ d, now }: { d: Departure; now: number }) {
  const mins = minutesUntil(d.time, now);
  const delayed = d.realtime && (d.delay ?? 0) > 0;
  const systemType = d.sev ? "SEV" : d.transportType;
  const iconSrc = iconFor(systemType);
  const sys = SYSTEM_BADGES[systemType];
  const line = lineBadgeColor(d.line, d.transportType);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1em 2.2em 1fr auto",
        alignItems: "center",
        columnGap: "0.35em",
        padding: "0.05em 0 0.5em 1px",
        lineHeight: 1,
        opacity: d.cancelled ? 0.45 : 1,
      }}
    >
      <SystemIcon iconSrc={iconSrc} fallback={sys} />
      <Badge text={d.line} bg={line.bg} fg={line.fg} />
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textDecoration: d.cancelled ? "line-through" : undefined,
          fontWeight: 500,
          color: TEXT,
        }}
        title={d.destination}
      >
        {d.destination}
      </span>
      <span
        style={{
          textAlign: "right",
          fontWeight: 600,
          color: d.cancelled ? "#ff6b6b" : delayed ? "#ff6b6b" : TEXT,
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
        // Single font size for ALL text in the section (header, badges,
        // destinations, minutes) — station boards don't use a subtitle
        // hierarchy. lineHeight:1 + badge height:1em keep text/badges
        // exactly the same visual height so their top/bottom edges align.
        fontSize: "0.85em",
        lineHeight: 1,
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
            color: "#ff6b6b",
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
          }}
        >
          Keine Abfahrten verfügbar.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridAutoRows: "auto",
            rowGap: "0.05em",
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

// Shared base — both `darkStation` and `transparentStation` use the exact
// same Section renderer, they only differ in whether the board paints its
// own black background or stays transparent.
const baseBoardStyle = {
  color: TEXT,
  fontFamily: FONT_STACK,
};

export const darkStation: Theme = {
  name: "darkStation",
  label: "Bahnhof (dunkel)",
  Section,
  boardStyle: {
    ...baseBoardStyle,
    background: "#000",
  },
};

export const transparentStation: Theme = {
  name: "transparentStation",
  label: "Bahnhof (transparent)",
  Section,
  boardStyle: baseBoardStyle,
};
