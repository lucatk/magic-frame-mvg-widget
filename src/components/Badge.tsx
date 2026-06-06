/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";

export function Badge({
  text,
  bg,
  fg,
  pill,
  weight,
}: {
  text: string;
  bg: string;
  fg: string;
  pill: boolean;
  weight: number;
}) {
  // Auto-shrink the text inside the badge so longer labels ("Tram") fit
  // the same height as short ones ("U") without breaking the row grid.
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
        fontWeight: weight,
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
