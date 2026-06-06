// Display helpers — colors, SVG icons, font injection, time formatting.
// Anything that's "what to put on screen" but isn't a component lives here.

import type { TransportType } from "./data/mvg";

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

export const FONT_STACK =
  '"Atkinson Hyperlegible", "Helvetica Neue", Helvetica, Arial, sans-serif';
export const DARK_TEXT = "#0d2a5b";
export const MUTED_TEXT = "#3c3c3c";

// ---------------------------------------------------------------------------
// MVG line / system colors
// ---------------------------------------------------------------------------

export type BadgeColor = { bg: string; fg: string };

export const LINE_COLORS: Record<string, BadgeColor> = {
  U1: { bg: "#438136", fg: "#fff" },
  U2: { bg: "#C40C0C", fg: "#fff" },
  U3: { bg: "#EC6726", fg: "#fff" },
  U4: { bg: "#00A984", fg: "#fff" },
  U5: { bg: "#BC7A00", fg: "#fff" },
  U6: { bg: "#0065AE", fg: "#fff" },
  U7: { bg: "#438136", fg: "#fff" },
  U8: { bg: "#C40C0C", fg: "#fff" },
  S1: { bg: "#16B5EA", fg: "#fff" },
  S2: { bg: "#76B82A", fg: "#fff" },
  S3: { bg: "#951B81", fg: "#fff" },
  S4: { bg: "#E30613", fg: "#fff" },
  S6: { bg: "#04AE5C", fg: "#fff" },
  S7: { bg: "#8E1A66", fg: "#fff" },
  S8: { bg: "#000000", fg: "#FECC00" },
  S20: { bg: "#F45B68", fg: "#fff" },
};

export type SystemBadgeStyle = BadgeColor & {
  label: string;
  /** true → pill (Tram/Bus), false → rounded-rect (U/S). */
  pill: boolean;
};

/** Used as the text fallback when no SVG icon is available for a system. */
export const SYSTEM_BADGES: Record<TransportType, SystemBadgeStyle> = {
  UBAHN: { label: "U", bg: "#0c2c63", fg: "#fff", pill: false },
  SBAHN: { label: "S", bg: "#0a8a3f", fg: "#fff", pill: false },
  TRAM: { label: "Tram", bg: "#b91725", fg: "#fff", pill: true },
  BUS: { label: "BUS", bg: "#00586A", fg: "#fff", pill: true },
  REGIONAL_BUS: { label: "BUS", bg: "#00586A", fg: "#fff", pill: true },
  BAHN: { label: "R", bg: "#444", fg: "#fff", pill: false },
  SCHIFF: { label: "F", bg: "#0a6066", fg: "#fff", pill: true },
  SEV: { label: "SEV", bg: "#888", fg: "#fff", pill: true },
};

/** Bus lines all share the corporate MVG bus color (matches the bus SVG). */
const BUS_LINE_COLOR: BadgeColor = { bg: "#00586A", fg: "#fff" };

export function lineBadgeColor(
  line: string,
  type: TransportType,
): BadgeColor {
  const direct = LINE_COLORS[line];
  if (direct) return direct;
  if (type === "BUS" || type === "REGIONAL_BUS") return BUS_LINE_COLOR;
  const sys = SYSTEM_BADGES[type];
  if (sys) return { bg: sys.bg, fg: sys.fg };
  return { bg: "#444", fg: "#fff" };
}

// ---------------------------------------------------------------------------
// System-type SVG icons (full badge baked in: background + letter)
// ---------------------------------------------------------------------------

const UBAHN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill="#2A63A9" d="M13 16H3c-1.7 0-3-1.3-3-3V3c0-1.7 1.3-3 3-3h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3"/><path fill="#fff" d="M8 13.5c-1.3 0-2.7-.3-3.5-1.5-.7-1-.9-2.1-.9-3.3V2.5h2.7v7c0 .7.2 1.5.9 1.8.6.2 1.5.1 1.9-.5.5-.9.4-1.9.4-2.8V2.5h2.7v7.3c0 1.3-.6 2.8-1.9 3.4-.6.2-1.4.3-2.3.3"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>`;

const SBAHN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><g fill-rule="evenodd" clip-rule="evenodd"><circle fill="#008d4f" cx="8" cy="8" r="8"/><path fill="#fff" d="M13.3 10.1c0 1.9-1.9 4.2-5.1 4.2-1.7 0-3.8-.8-4.9-1.8V10c1.1 1.5 3 2.7 4.9 2.7 1.2 0 2.1-.7 2.1-1.4 0-2.7-7.1-1.1-7.1-5.7 0-2.5 2.4-3.8 4.6-3.8 1.8 0 3.4.6 4.7 1.6v2.1c-1.1-1.2-2.8-2.3-4.7-2.3-1.2 0-1.8.5-1.8 1.3 0 2.9 7.3.8 7.3 5.6"/></g></svg>`;

const TRAM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill="#D82020" d="M13 16H3c-1.7 0-3-1.3-3-3V3c0-1.7 1.3-3 3-3h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3"/><path fill="#fff" fill-rule="evenodd" d="M4.4 6.1v-.7H1.7v.7h.9v3.7h.8V6.1M6.4 6.5c-.1 0-.2-.1-.3-.1-.3 0-.6.1-.8.5v-.4h-.6v3.2h.8V8c0-.4.1-.8.5-.8h.2M9.1 9.7c0-.2-.1-.4-.1-.6V7.3c0-.5-.4-.9-1.1-.9-.3 0-.7.1-1.1.2l.2.5c.2-.1.5-.2.7-.2.3 0 .5.1.5.5v.3h-.4c-.7 0-1.2.3-1.2 1 0 .6.3.9.9.9.3 0 .6-.1.8-.4l.1.4m-.1-.9c0 .3-.3.5-.5.5-.3 0-.4-.2-.4-.5s.1-.5.5-.5c.2 0 .3 0 .4.1v.4M13.9 9.7V7.4c0-.5-.3-1-.9-1-.4 0-.7.2-.8.5-.1-.2-.3-.5-.8-.5-.4 0-.7.2-.8.5l-.1-.4h-.6v3.2h.7v-2c0-.3.1-.7.5-.7.3 0 .4.2.4.5v2.2h.7v-2c0-.3.1-.7.5-.7.3 0 .4.2.4.5v2.2" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>`;

const BUS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill="#00586A" d="M8 16c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8"/><path fill="#fff" d="M5.3 9.2c0-.8-.6-1.2-1.3-1.3.6-.2 1-.6 1-1.3 0-1-.8-1.4-1.7-1.4H1.6v5.6h1.9c1 0 1.8-.6 1.8-1.6M4 6.7c0 .5-.3.8-.8.8h-.6V6h.6c.5 0 .8.2.8.7m.2 2.4c0 .5-.3.9-.8.9h-.8V8.3h.7c.5 0 .9.3.9.8M10.3 8.8V5.2h-1v3.5c0 .7-.2 1.3-1 1.3s-1-.6-1-1.3V5.2h-1v3.6c0 1.3.7 2.1 2 2.1s2-.8 2-2.1M14.7 9.2c0-1.9-2.3-1.3-2.3-2.5 0-.6.4-.8 1-.8.3 0 .6.1.9.2l.2-.8c-.4-.1-.8-.2-1.2-.2-1 0-2 .5-2 1.6 0 2 2.2 1.2 2.2 2.5 0 .7-.6.9-1.1.9-.4 0-.8-.1-1.1-.2v.9c.4.1.8.2 1.2.2 1.2-.1 2.2-.6 2.2-1.8"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>`;

function dataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SYSTEM_ICONS: Partial<Record<TransportType, string>> = {
  UBAHN: dataUrl(UBAHN_SVG),
  SBAHN: dataUrl(SBAHN_SVG),
  TRAM: dataUrl(TRAM_SVG),
  BUS: dataUrl(BUS_SVG),
  REGIONAL_BUS: dataUrl(BUS_SVG),
};

// ---------------------------------------------------------------------------
// Time / formatting
// ---------------------------------------------------------------------------

export function minutesUntil(unixSec: number, nowMs: number): number {
  return Math.max(0, Math.round((unixSec * 1000 - nowMs) / 60000));
}

// ---------------------------------------------------------------------------
// Font loading (Atkinson Hyperlegible, via Google Fonts)
// ---------------------------------------------------------------------------

export function ensureFont(): void {
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
