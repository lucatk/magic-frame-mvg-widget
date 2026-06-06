/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";
import { MUTED_TEXT } from "../helpers";

export function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "end",
        borderTop: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a",
        padding: "0.2em 0",
        columnGap: "1em",
      }}
    >
      <div style={{ lineHeight: 1.1 }}>
        <span style={{ fontWeight: 700, fontSize: "0.9em" }}>{title}</span>
        {subtitle ? (
          <span
            style={{
              fontWeight: 400,
              fontSize: "0.65em",
              color: MUTED_TEXT,
              marginLeft: "0.35em",
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
      <div style={{ textAlign: "right", lineHeight: 1.1 }}>
        <div style={{ fontWeight: 700, fontSize: "0.6em" }}>
          Abfahrt in min.
        </div>
        <div
          style={{ fontWeight: 400, fontSize: "0.5em", color: MUTED_TEXT }}
        >
          departure in mins.
        </div>
      </div>
    </div>
  );
}
