// Theme registry. Each theme is a self-contained renderer for one station
// section, plus a board-level container style and an optional onMount hook
// (for loading webfonts etc.). Themes are independent — they don't share
// sub-components, so they can render the same data however they want.

import type { Departure } from "../data/mvg";
import { lightVehicle } from "./lightVehicle";
import { darkStation, transparentStation } from "./darkStation";

export interface SectionProps {
  title: string;
  subtitle?: string;
  deps: Departure[];
  now: number;
  error: string | null;
  loading: boolean;
  limit: number;
}

export interface Theme {
  /** Stable key used in the manifest field. */
  name: string;
  /** Human-readable label (currently for docs only). */
  label: string;
  /** Renders one station section, given resolved data. */
  Section: (props: SectionProps) => JSX.Element;
  /** Style applied to the outer board container by MvgBoard. */
  boardStyle: Record<string, string | number>;
  /** One-time side effects (e.g. injecting a Google Fonts <link>). */
  onMount?: () => void;
}

export const THEMES: Record<string, Theme> = {
  [lightVehicle.name]: lightVehicle,
  [darkStation.name]: darkStation,
  [transparentStation.name]: transparentStation,
};

export const DEFAULT_THEME = lightVehicle.name;

export function resolveTheme(name: unknown): Theme {
  if (typeof name === "string" && THEMES[name]) return THEMES[name];
  return THEMES[DEFAULT_THEME];
}
