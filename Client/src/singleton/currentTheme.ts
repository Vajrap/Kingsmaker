import {
  classicTheme,
  darkTheme,
  type GameUIColorTheme,
} from "@/theme/default";

export const currentTheme: GameUIColorTheme = initTheme();

function initTheme() {
  const storageTheme = localStorage.getItem("kingsmaker-theme") ?? "classic";
  if (storageTheme === "dark") {
    return darkTheme;
  }
  return classicTheme;
}
