/** @jsxRuntime classic */
/** @jsx h */
import { h, setRuntime } from "./runtime";
import { MvgBoard } from "./components/MvgBoard";

export const manifest: MagicFrameManifest = {
  type: "mvg",
  label: "MVG Abfahrten",
  description: "Live MVG departures for a station.",
  iconEmoji: "🚊",
  version: "0.1.0",
  author: "lucakillmaier",
  fields: [
    {
      key: "stops",
      label: "Haltestellen",
      type: "textarea",
      placeholder: "z. B.\nMarienplatz\nUniversität",
      default: "Universität",
      help: "Eine Haltestelle pro Zeile (Name oder de:09162:NN ID). Optional Transport-Filter anhängen: 'Universität;BUS,TRAM'. Erlaubte Typen: UBAHN, SBAHN, TRAM, BUS, REGIONAL_BUS, BAHN, SCHIFF, SEV.",
    },
    {
      key: "limit",
      label: "Abfahrten pro Station",
      type: "number",
      default: 8,
    },
    {
      key: "offsetMinutes",
      label: "Vorlaufzeit (Minuten)",
      type: "number",
      default: 0,
    },
  ],
};

export default function render(ctx: MagicFrameCtx) {
  // Refresh the host-injected React primitives on every render so all
  // component files (via `import { h } from "./runtime"`) see the current ctx.
  setRuntime(ctx);
  // Hooks live inside MvgBoard, not directly in render(). The host's
  // CustomWidget wrapper only calls render() once `mod` is loaded, so calling
  // hooks here would change the wrapper's hook count between renders.
  return <MvgBoard ctx={ctx} />;
}
