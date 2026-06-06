// Host-injected React primitives, accessed as ESM live bindings by every
// component file. `setRuntime(ctx)` runs at the top of widget.tsx's `render`,
// so by the time any component's JSX (`h(...)`) executes, these are set.
//
// Importing `h` / `Fragment` here is what makes the `@jsx h` / `@jsxFrag
// Fragment` pragmas resolve in every component file without pulling React
// into the bundle.
export let h: MagicFrameCtx["createElement"] =
  null as unknown as MagicFrameCtx["createElement"];
export let Fragment: MagicFrameCtx["Fragment"] =
  null as unknown as MagicFrameCtx["Fragment"];

export function setRuntime(ctx: MagicFrameCtx): void {
  h = ctx.createElement;
  Fragment = ctx.Fragment;
}
