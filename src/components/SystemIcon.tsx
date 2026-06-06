/** @jsxRuntime classic */
/** @jsx h */
import { h } from "../runtime";
import { Badge } from "./Badge";
import type { SystemBadgeStyle } from "../helpers";

export function SystemIcon({
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
      weight={800}
    />
  );
}
