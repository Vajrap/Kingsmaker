import { currentTheme } from "@/singleton/currentTheme";

export const lobbyContainerStyle = {
  maxW: "1200px",
  mx: "auto",
  py: 8,
  px: 4,
  bg: currentTheme.backgroundColor,
  minH: "100vh",
};

export const lobbyHeaderStyle = {
  justify: "space-between",
  align: "center",
  bg: currentTheme.panelBackgroundColor,
  p: 6,
  rounded: "lg",
  border: "1px",
  borderColor: currentTheme.borderColor,
};

export const lobbyTitleStyle = {
  mb: 1,
  color: currentTheme.headingTextColor,
};

export const lobbyWelcomeTextStyle = {
  color: currentTheme.textColor,
};

export const lobbyButtonGroupStyle = {
  gap: 3,
};

export const lobbyButtonStyle = {
  fontSize: "1rem",
  fontWeight: "bold",
  color: currentTheme.buttonTextActive,
  background: currentTheme.buttonActive,
  w: "auto",
  h: "auto",
  px: 4,
  py: 2,
  _disabled: {
    background: currentTheme.buttonDeactive,
    color: currentTheme.buttonTextDeactive,
  },
  _hover: {
    background: currentTheme.buttonHighlight,
    color: currentTheme.buttonTextHighlight,
  },
};

export const lobbyDangerButtonStyle = {
  bg: currentTheme.dangerColor,
  color: currentTheme.textColor,
  w: "auto",
  h: "auto",
  px: 4,
  py: 2,
  _hover: { 
    bg: currentTheme.dangerColor, 
    opacity: 0.8 
  },
};

export const lobbySectionHeaderStyle = {
  justify: "space-between",
  align: "center",
  mt: 6,
};

export const lobbySectionTitleStyle = {
  color: currentTheme.subHeadingTextColor,
};

export const lobbyEmptyStateStyle = {
  textAlign: "center" as const,
  py: 8,
  fontSize: "lg",
  color: currentTheme.mutedTextColor,
};

export const lobbyTableContainerStyle = {
  mt: 4,
  border: "1px",
  borderColor: currentTheme.borderColor,
  rounded: "md",
  overflow: "hidden",
  bg: currentTheme.panelBackgroundColor,
};

export const lobbyTableStyle = {
  as: "table" as const,
  w: "100%",
  style: { borderCollapse: 'collapse' as const },
};

export const lobbyTableHeaderStyle = {
  as: "thead" as const,
  bg: currentTheme.hudBackgroundColor,
};

export const lobbyTableHeaderCellStyle = {
  as: "th" as const,
  p: 3,
  textAlign: "left" as const,
  borderBottom: "1px",
  borderColor: currentTheme.borderColor,
  color: currentTheme.subHeadingTextColor,
};

export const lobbyTableRowStyle = {
  as: "tr" as const,
  borderBottom: "1px",
  borderColor: currentTheme.borderColor,
};

export const lobbyTableCellStyle = {
  as: "td" as const,
  p: 3,
};

export const lobbyTableTextStyle = {
  fontWeight: "bold",
  color: currentTheme.textColor,
};

export const lobbyTableSubTextStyle = {
  fontSize: "sm",
  color: currentTheme.mutedTextColor,
};

export const lobbyLoadingContainerStyle = {
  justify: "center",
  align: "center",
  h: "100vh",
  bg: currentTheme.backgroundColor,
};

export const lobbyLoadingSpinnerStyle = {
  mr: 4,
  color: currentTheme.primaryColor,
};

export const lobbyLoadingTextStyle = {
  color: currentTheme.textColor,
}; 