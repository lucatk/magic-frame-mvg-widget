// MVG API client — TypeScript port of https://github.com/mondbaron/mvg
// Hits the same public endpoints as the official mvg.de web app.

export const FIB_BASE = "https://www.mvg.de/api/bgw-pt/v3";
export const ZDM_BASE = "https://www.mvg.de/.rest/zdm";
export const DEFAULT_LIMIT = 10;

const STATION_ID_RE = /^de:[0-9]{2,5}:[0-9]+$/;

export type TransportType =
  | "BAHN"
  | "SBAHN"
  | "UBAHN"
  | "TRAM"
  | "BUS"
  | "REGIONAL_BUS"
  | "SEV"
  | "SCHIFF";

export const TRANSPORT_TYPE_META: Record<
  TransportType,
  { label: string; icon: string }
> = {
  BAHN: { label: "Bahn", icon: "mdi:train" },
  SBAHN: { label: "S-Bahn", icon: "mdi:subway-variant" },
  UBAHN: { label: "U-Bahn", icon: "mdi:subway" },
  TRAM: { label: "Tram", icon: "mdi:tram" },
  BUS: { label: "Bus", icon: "mdi:bus" },
  REGIONAL_BUS: { label: "Regionalbus", icon: "mdi:bus" },
  SEV: { label: "SEV", icon: "mdi:taxi" },
  SCHIFF: { label: "Schiff", icon: "mdi:ferry" },
};

/**
 * All transport types accepted by the API's `transportTypes` filter.
 * SEV is intentionally omitted — passing it triggers a 400. Rail-replacement
 * services come back tagged with their original transport type plus a
 * separate `sev: true` flag on the departure.
 */
export const ALL_TRANSPORT_TYPES: TransportType[] = [
  "BAHN",
  "SBAHN",
  "UBAHN",
  "TRAM",
  "BUS",
  "REGIONAL_BUS",
  "SCHIFF",
];

export interface Station {
  id: string;
  name: string;
  place: string;
  latitude: number;
  longitude: number;
}

export interface Departure {
  /** Realtime departure time as unix seconds (falls back to planned if no realtime). */
  time: number;
  /** Planned departure time as unix seconds. */
  planned: number;
  /** Delay in minutes, or null if not reported. */
  delay: number | null;
  /** Platform identifier as reported by API, or null. */
  platform: string | number | null;
  realtime: boolean;
  /** Line label, e.g. "U3", "S8", "X30". */
  line: string;
  destination: string;
  /** Raw transport type from API ("UBAHN", "SBAHN", "TRAM", "BUS", …). */
  transportType: TransportType;
  /** Human-readable type ("U-Bahn", "Bus", …). */
  type: string;
  /** Material-design icon name ("mdi:subway", …). */
  icon: string;
  cancelled: boolean;
  /** True when this is a rail-replacement service (Schienenersatzverkehr). */
  sev: boolean;
  /** Raw message objects from the API — shape varies; treat as opaque. */
  messages: unknown[];
}

export interface Line {
  label: string;
  transportType: string;
  sev: boolean;
  divaId: string;
}

export class MvgApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MvgApiError";
  }
}

export interface MvgRequestOptions {
  /** Custom fetch (default: globalThis.fetch). Pass `ctx.fetch` from a widget. */
  fetch?: typeof fetch;
  signal?: AbortSignal;
}

export function isValidStationId(stationId: string): boolean {
  return STATION_ID_RE.test(stationId);
}

function buildUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const url = new URL(base + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function apiGet<T>(url: string, opts: MvgRequestOptions): Promise<T> {
  const fetchImpl = opts.fetch ?? fetch;
  let resp: Response;
  try {
    resp = await fetchImpl(url, { signal: opts.signal });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new MvgApiError(`Bad API call: ${msg} from ${url}`);
  }
  if (!resp.ok) {
    throw new MvgApiError(
      `Bad API call: Got response (${resp.status}) from ${url}.`,
    );
  }
  const contentType = resp.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new MvgApiError(
      `Bad API call: Got content type ${contentType} from ${url}.`,
    );
  }
  return (await resp.json()) as T;
}

interface RawLocation {
  globalId: string;
  name: string;
  place: string;
  latitude: number;
  longitude: number;
}

interface RawDeparture {
  realtimeDepartureTime?: number;
  plannedDepartureTime: number;
  delayInMinutes?: number;
  platform?: string | number;
  realtime?: boolean;
  label: string;
  destination: string;
  transportType: TransportType;
  cancelled?: boolean;
  sev?: boolean;
  messages?: unknown[];
}

/**
 * Find a station by free-text query (name, "name, place") or by global station ID.
 * Returns null when no station matches.
 */
export async function findStation(
  query: string,
  opts: MvgRequestOptions = {},
): Promise<Station | null> {
  const q = query.trim();
  if (isValidStationId(q)) {
    const url = buildUrl(ZDM_BASE, `/stations/${encodeURIComponent(q)}`);
    const r = await apiGet<RawLocation & { id: string }>(url, opts);
    if (!r || typeof r !== "object") {
      throw new MvgApiError("Bad API call: Expected object.");
    }
    return {
      id: r.id,
      name: r.name,
      place: r.place,
      latitude: r.latitude,
      longitude: r.longitude,
    };
  }

  const url = buildUrl(FIB_BASE, "/locations", {
    query: q,
    locationTypes: "STATION",
  });
  const r = await apiGet<RawLocation[]>(url, opts);
  if (!Array.isArray(r)) {
    throw new MvgApiError("Bad API call: Expected list.");
  }
  if (r.length === 0) return null;
  const first = r[0];
  return {
    id: first.globalId,
    name: first.name,
    place: first.place,
    latitude: first.latitude,
    longitude: first.longitude,
  };
}

/** Find stations near a geo coordinate, ordered by distance. */
export async function nearbyStations(
  latitude: number,
  longitude: number,
  opts: MvgRequestOptions = {},
): Promise<Station[]> {
  const url = buildUrl(FIB_BASE, "/stations/nearby", { latitude, longitude });
  const r = await apiGet<RawLocation[]>(url, opts);
  if (!Array.isArray(r)) {
    throw new MvgApiError("Bad API call: Expected list.");
  }
  return r.map((s) => ({
    id: s.globalId,
    name: s.name,
    place: s.place,
    latitude: s.latitude,
    longitude: s.longitude,
  }));
}

export interface DepartureOptions extends MvgRequestOptions {
  /** Max results (API caps at 100). Default: 10. */
  limit?: number;
  /** Skip departures within `offsetInMinutes` from now (e.g. walking time). */
  offsetInMinutes?: number;
  /** Filter by transport type. Defaults to all real types (SEV excluded). */
  transportTypes?: TransportType[];
}

/** Next departures from a station, sorted by time. */
export async function departures(
  stationId: string,
  opts: DepartureOptions = {},
): Promise<Departure[]> {
  if (!isValidStationId(stationId)) {
    throw new RangeError("Invalid format of global station ID.");
  }
  const types = opts.transportTypes ?? ALL_TRANSPORT_TYPES;
  const url = buildUrl(FIB_BASE, "/departures", {
    globalId: stationId,
    limit: opts.limit ?? DEFAULT_LIMIT,
    offsetInMinutes: opts.offsetInMinutes ?? 0,
    transportTypes: types.join(","),
  });
  const r = await apiGet<RawDeparture[]>(url, opts);
  if (!Array.isArray(r)) {
    throw new MvgApiError("Bad API call: Expected list.");
  }
  return r.map((d) => {
    const meta = TRANSPORT_TYPE_META[d.transportType] ?? {
      label: String(d.transportType ?? ""),
      icon: "",
    };
    const realtimeMs = d.realtimeDepartureTime ?? d.plannedDepartureTime;
    return {
      time: Math.floor(realtimeMs / 1000),
      planned: Math.floor(d.plannedDepartureTime / 1000),
      delay: d.delayInMinutes ?? null,
      platform: d.platform ?? null,
      realtime: !!d.realtime,
      line: d.label,
      destination: d.destination,
      transportType: d.transportType,
      type: meta.label,
      icon: meta.icon,
      cancelled: !!d.cancelled,
      sev: !!d.sev,
      messages: d.messages ?? [],
    };
  });
}

/** All lines, or lines serving a specific station if `stationId` is given. */
export async function lines(
  stationId?: string,
  opts: MvgRequestOptions = {},
): Promise<Line[]> {
  let path = "/lines";
  if (stationId !== undefined) {
    if (!isValidStationId(stationId)) {
      throw new RangeError("Invalid format of global station ID.");
    }
    path = `/lines/${encodeURIComponent(stationId)}`;
  }
  const r = await apiGet<Line[]>(buildUrl(FIB_BASE, path), opts);
  if (!Array.isArray(r)) {
    throw new MvgApiError("Bad API call: Expected list.");
  }
  return r;
}

/** All valid global station IDs (sorted). */
export async function stationIds(opts: MvgRequestOptions = {}): Promise<string[]> {
  const r = await apiGet<string[]>(
    buildUrl(ZDM_BASE, "/mvgStationGlobalIds"),
    opts,
  );
  if (!Array.isArray(r)) {
    throw new MvgApiError("Bad API call: Expected list.");
  }
  return [...r].sort();
}

/** Full station catalog from ZDM (raw shape — many extra fields). */
export async function stations(
  opts: MvgRequestOptions = {},
): Promise<unknown[]> {
  const r = await apiGet<unknown[]>(buildUrl(ZDM_BASE, "/stations"), opts);
  if (!Array.isArray(r)) {
    throw new MvgApiError("Bad API call: Expected list.");
  }
  return r;
}
