import type * as React from "react";

declare global {
  namespace JSX {
    interface Element extends React.JSX.Element {}
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
    interface ElementChildrenAttribute
      extends React.JSX.ElementChildrenAttribute {}
  }

  interface MagicFrameCtx {
    createElement: typeof React.createElement;
    Fragment: typeof React.Fragment;
    useState: typeof React.useState;
    useEffect: typeof React.useEffect;
    useRef: typeof React.useRef;
    useMemo: typeof React.useMemo;
    useCallback: typeof React.useCallback;
    config: Record<string, unknown>;
    dashboardId?: string;
    fetch: typeof fetch;
  }

  type MagicFrameField =
    | MagicFrameTextField
    | MagicFrameTextareaField
    | MagicFrameNumberField
    | MagicFrameBooleanField
    | MagicFrameColorField
    | MagicFrameUrlField;

  interface MagicFrameFieldBase {
    key: string;
    label: string;
    help?: string;
    required?: boolean;
    placeholder?: string;
  }
  interface MagicFrameTextField extends MagicFrameFieldBase {
    type: "text";
    default?: string;
  }
  interface MagicFrameTextareaField extends MagicFrameFieldBase {
    type: "textarea";
    default?: string;
  }
  interface MagicFrameNumberField extends MagicFrameFieldBase {
    type: "number";
    default?: number;
  }
  interface MagicFrameBooleanField extends MagicFrameFieldBase {
    type: "boolean";
    default?: boolean;
  }
  interface MagicFrameColorField extends MagicFrameFieldBase {
    type: "color";
    default?: string;
  }
  interface MagicFrameUrlField extends MagicFrameFieldBase {
    type: "url";
    default?: string;
  }

  interface MagicFrameManifest {
    type: string;
    label: string;
    description?: string;
    iconEmoji?: string;
    version?: string;
    author?: string;
    homepage?: string;
    fields?: MagicFrameField[];
  }
}

export {};
