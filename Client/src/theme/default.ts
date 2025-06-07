export const defaultStyle = {
  headingSize: "2rem",
  subHeadingSize: "1.5rem",
  fontSize: "1rem",
  fontFamily: "Arial, sans-serif",
  color: "#333",
};

export type GameUIColorTheme = {
  // Core action colors
  primaryColor: string; // e.g., main buttons, active highlights
  secondaryColor: string; // e.g., secondary buttons, muted actions
  accentColor: string; // e.g., glows, selection rings, decorative effects

  // Backgrounds
  backgroundColor: string; // main background
  panelBackgroundColor: string; // card, modal, menu panels
  overlayBackgroundColor: string; // semi-transparent overlays, modals
  hudBackgroundColor: string; // in-game HUD backgrounds
  dialogBoxBackgroundColor: string; // dialog boxes

  // Text
  headingTextColor: string; // main headings, titles
  subHeadingTextColor: string; // secondary headings, subtitles
  textColor: string; // main readable text
  mutedTextColor: string; // less prominent, descriptions or labels
  disabledColor: string; // inactive or unavailable items

  // Borders and outlines
  borderColor: string; // general container or input borders

  // Feedback colors
  successColor: string; // confirmations, healing
  dangerColor: string; // damage, errors
  warningColor: string; // cautions, alerts
  highlightColor: string; // hovered or selected states

  // Button-specific
  buttonActive: string;
  buttonDeactive: string;
  buttonHighlight: string;

  buttonTextActive: string;
  buttonTextDeactive: string;
  buttonTextHighlight: string;
};

export const classicTheme: GameUIColorTheme = {
  primaryColor: "#9d6a3a", // earthy bronze, for buttons and key actions
  secondaryColor: "#c69d78", // lighter brown, for less prominent actions
  accentColor: "#bfa14a", // gold, for glows, trims, dividers

  backgroundColor: "#f5ede6", // parchment-like background
  panelBackgroundColor: "#fffaf5", // soft light for panels
  overlayBackgroundColor: "rgba(0, 0, 0, 0.8)", // dark semi-transparent overlay
  hudBackgroundColor: "#e6d3c2", // tan tone for HUD
  dialogBoxBackgroundColor: "#fffaf5", // soft light for dialog boxes

  headingTextColor: "#120b06", // near-black brown
  subHeadingTextColor: "#2a1d11", // medium brown for secondary text
  textColor: "#342313", // near-black brown
  mutedTextColor: "#7a522d", // medium brown for secondary text
  disabledColor: "#d6b89d", // pale faded brown

  borderColor: "#b68253", // bronze borders

  successColor: "#4e944f", // green for healing
  dangerColor: "#a94442", // dark red for damage
  warningColor: "#a94442", // gold for alerts
  highlightColor: "#bfa14a", // gold glow on hover/select

  // Button-specific
  buttonActive: "#2d4373", // darker blue on press
  buttonDeactive: "#aab8d4", // faded blue
  buttonHighlight: "#4966aa", // on hover/focus

  buttonTextActive: "#ffffff",
  buttonTextDeactive: "#fff9f0",
  buttonTextHighlight: "#f5ede6",
};

export const darkTheme: GameUIColorTheme = {
  primaryColor: "#bfa14a", // golden primary for highlights
  secondaryColor: "#6b4f8a", // muted purple for secondary elements
  accentColor: "#4e944f", // green glow or power accents

  backgroundColor: "#1a1a1a", // deep black-gray base
  panelBackgroundColor: "#2a2a2a", // slightly lighter panels
  overlayBackgroundColor: "rgba(255, 255, 255, 0.1)", // light transparent overlay
  hudBackgroundColor: "#1f1f1f", // HUD blend into bg
  dialogBoxBackgroundColor: "#2a2a2a", // slightly lighter panels

  headingTextColor: "#ffffff", // near-black brown
  subHeadingTextColor: "#fff9f0", // medium brown for secondary text
  textColor: "#f5ede6", // light parchment text
  mutedTextColor: "#bfa14a", // gold-muted text
  disabledColor: "#555", // gray for disabled elements

  borderColor: "#573b20", // dark bronze

  successColor: "#4e944f", // green
  dangerColor: "#a94442", // deep red
  warningColor: "#e6d3c2", // tan-gold
  highlightColor: "#bfa14a", // glowing gold for focus

  buttonActive: "#bfa14a",
  buttonDeactive: "#2a2a2a",
  buttonHighlight: "#4e944f",

  buttonTextActive: "#1a1a1a",
  buttonTextDeactive: "#bfa14a",
  buttonTextHighlight: "#ffffff",
};
