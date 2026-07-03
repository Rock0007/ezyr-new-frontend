export const platformColors = {
  ink: "#172033",
  inkMuted: "#475467",
  inkSubtle: "#667085",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  surfaceCanvas: "#eef3f8",
  border: "#d8dee9",
  borderSoft: "#e4e7ec",
  brand: "#0f8ca8",
  brandStrong: "#08708a",
  brandSoft: "#e6f6fa",
  brandWash: "#f1fbfe",
  success: "#12b76a",
  warning: "#f79009",
  danger: "#d92d20",
  focus: "#18a8c7",
} as const;

export const platformTheme = {
  colorPrimary: platformColors.brand,
  borderRadius: 6,
  colorBgLayout: "#f5f7fb",
  fontFamily: "var(--font-geist-sans)",
} as const;

export type PlatformColorName = keyof typeof platformColors;
