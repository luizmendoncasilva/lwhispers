import { createTheme } from "@mui/material/styles";
import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const PURPLE = {
  vivid: "#d16aff",
  bright: "#bb44f0",
  base: "#9614d0",
  deep: "#660094",
  ink: "#310047",
};

export const SWATCHES = [PURPLE.base, PURPLE.bright, "#5B8CFF", "#3FD68C", "#FFB454", "#FF6FA5", "#e05252", "#9a94a3"];

const T = {
  bg: "#faf9fb",
  bgSoft: "#f3f0f6",
  surface: "#ffffff",
  surfaceAlt: "#f6f4f9",
  border: "#e7e2ee",
  borderSoft: "#efecf3",
  text: "#1c1420",
  textMuted: "#6f6879",
  textFaint: "#a79fb0",
  danger: "#d63c3c",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: PURPLE.base, light: PURPLE.vivid, dark: PURPLE.deep, contrastText: "#ffffff" },
    background: { default: T.bg, paper: T.surface },
    text: { primary: T.text, secondary: T.textMuted, disabled: T.textFaint },
    divider: T.border,
    error: { main: T.danger },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-inter), 'Inter', sans-serif",
    h1: { fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 700 },
    h2: { fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 700 },
    h3: { fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 700 },
    h4: { fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, fontSize: 22 },
    h5: { fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, fontSize: 17 },
    h6: { fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, fontSize: 15 },
    button: { textTransform: "none", fontWeight: 500 },
    overline: { fontFamily: "var(--font-jetbrains-mono), monospace", letterSpacing: 0.3, fontSize: 11, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "::selection": { background: `${PURPLE.base}22` },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 9, fontSize: 13.5, padding: "6px 13px" },
        sizeSmall: { fontSize: 12.5, padding: "4px 10px" },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 9 } },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: `1px solid ${T.border}`, boxShadow: "none", borderRadius: 12 },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 14, "&:last-child": { paddingBottom: 14 } } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, borderRadius: 6, height: 22 },
        label: { padding: "0 8px" },
        sizeSmall: { height: 20 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "8px 12px", fontSize: 12.5, borderColor: T.borderSoft },
        head: { fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: 0.3, color: T.textFaint, padding: "8px 12px" },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 9, background: T.surfaceAlt } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 9 } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { background: T.bgSoft, borderRight: `1px solid ${T.border}` } },
    },
    MuiAppBar: {
      styleOverrides: { root: { background: `${T.bg}cc`, backdropFilter: "blur(10px)", color: T.text, borderBottom: `1px solid ${T.border}` } },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { fontSize: 11.5 } },
    },
  },
});

export { T };
