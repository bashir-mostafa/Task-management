import React from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

export default function PasswordRequirements({
  password,
  confirmPassword,
  passwordsMatch,
  isRTL,
}) {
  const { t } = useTranslation();

  const requirements = [
    { met: password.length >= 8, text: t("min8Characters") },
    { met: /\d/.test(password), text: t("atLeastOneNumber") },
    { met: /[a-zA-Z]/.test(password), text: t("atLeastOneLetter") },
    {
      met: confirmPassword && passwordsMatch,
      text: t("passwordsMustMatch"),
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h4
        className={`text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        {t("passwordRequirements")}:
      </h4>

      <ul
        className={`text-xs text-gray-600 dark:text-gray-400 space-y-1 ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 ${
              req.met ? "text-green-600" : ""
            } ${isRTL ? "text-right" : ""}`}
          >
            {req.met ? (
              <Check size={14} />
            ) : (
              <span className="text-gray-400">•</span>
            )}

            <span>{req.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}