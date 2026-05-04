import { loadFont } from "@remotion/google-fonts/Inter";
const { fontFamily } = loadFont("normal", { weights: ["300", "400", "600", "700", "800"], subsets: ["latin"] });
export const FONT = fontFamily;
export const COLORS = {
  bg: "#06101F",
  bgDeep: "#020812",
  ink: "#F4F8FC",
  inkDim: "#8FA3BD",
  cyan: "#22D3EE",
  teal: "#14B8A6",
  amber: "#F59E0B",
  rule: "rgba(244,248,252,0.12)",
};
