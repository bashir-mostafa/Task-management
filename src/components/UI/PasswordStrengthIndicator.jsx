import React from "react";
import { useTranslation } from "react-i18next";

export default function PasswordStrengthIndicator({ password, isRTL }) {
  const { t } = useTranslation();

  const getPasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/\d/.test(password)) strength++;
    if (/[a-zA-Z]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    return strength;
  };

  const strength = getPasswordStrength(password);

  const strengthLabel =
    strength <= 1
      ? t("weak")
      : strength === 2
      ? t("medium")
      : strength >= 3
      ? t("strong")
      : "";

  const strengthColor =
    strength <= 1
      ? "text-red-500"
      : strength === 2
      ? "text-yellow-500"
      : "text-green-500";

  const barColor = (index) => {
    if (index <= strength) {
      if (strength <= 1) return "bg-red-500";
      if (strength === 2) return "bg-yellow-500";
      return "bg-green-500";
    }
    return "bg-gray-300 dark:bg-gray-600";
  };

  return (
    <div className="mt-3">
      <div
        className={`flex justify-between items-center mb-2 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {t("passwordStrength")}:
        </span>

        <span className={`text-xs font-medium ${strengthColor}`}>{strengthLabel}</span>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${barColor(
              i
            )}`}
          />
        ))}
      </div>
    </div>
  );
}