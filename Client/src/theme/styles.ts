import { currentTheme } from "@/singleton/currentTheme";
import { defaultStyle } from "./default";

export const headingStyle = {
  fontSize: defaultStyle.headingSize,
  fontWeight: "bold",
  color: currentTheme.headingTextColor,
};

export const subHeadingStyle = {
  fontSize: defaultStyle.subHeadingSize,
  fontWeight: "bold",
  color: currentTheme.subHeadingTextColor,
};

export const inputStyle = {
  fontSize: defaultStyle.fontSize,
  fontWeight: "bold",
  color: currentTheme.textColor,
};

export const textStyle = {
  fontSize: defaultStyle.fontSize,
  color: currentTheme.textColor,
};

export const buttonStyle = {
  fontSize: defaultStyle.fontSize,
  w: "full",
  h: "4rem",
  fontWeight: "bold",
  color: currentTheme.buttonTextActive,
  background: currentTheme.buttonActive,
  _disabled: {
    background: currentTheme.buttonDeactive,
    color: currentTheme.buttonTextDeactive,
  },
  _hover: {
    background: currentTheme.buttonHighlight,
    color: currentTheme.buttonTextHighlight,
  },
};

export const linkStyle = {
  fontSize: defaultStyle.fontSize,
  fontWeight: "bold",
  color: currentTheme.textColor,
};

export const warningStyle = {
  fontSize: "sm",
  color: "red.500",
};

export const backgroundStyle = {
  minH: "100vh",
  align: "center",
  justify: "center",
  bg: currentTheme.backgroundColor,
};

export const mainBoxStyle = {
  rounded: "lg",
  boxShadow: "lg",
  p: 8,
  maxW: "md",
  w: "full",
  background: currentTheme.panelBackgroundColor,
  border: "1px solid",
  borderColor: currentTheme.borderColor,
};

export const dialogBoxStyle = {
  rounded: "2xl",
  boxShadow: "dark-lg",
  p: 8,
  maxW: "lg",
  w: "full",
  background: currentTheme.dialogBoxBackgroundColor,
  border: "3px solid",
  borderColor: currentTheme.borderColor,
};
