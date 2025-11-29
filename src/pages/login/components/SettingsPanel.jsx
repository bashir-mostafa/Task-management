// src/components/Settings/SettingsPanel.jsx
import React from "react";
import DarkModeToggle from "../../../components/Settings/DarkModeToggle";
import ColorThemePicker from "../../../components/Settings/ColorThemePicker";
import LanguageSwitcher from "../../../components/Settings/LanguageSwitcher";

export default function SettingsPanel({
  position = "bottom-right", // غيرت الافتراضي إلى الأسفل
  className = "",
  showLabels = false,
}) {
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-6 left-6";
      case "top-right":
        return "top-6 right-6";
      case "bottom-left":
        return "bottom-6 left-6";
      case "bottom-right":
        return "bottom-6 right-6";
      default:
        return "top-6 right-6";
    }
  };

  return (
    <>
      <div
        className={`absolute z-20 flex gap-3 ${getPositionClasses()} ${className}`}>
        <DarkModeToggle />
        <LanguageSwitcher />
      </div>

      <div
        className={`absolute bottom-4 z-20 ${
          position.includes("left") ? "left-4" : "right-4"
        }`}>
        <ColorThemePicker />
      </div>
    </>
  );
}
