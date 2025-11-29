import React from "react";
import { useTranslation } from "react-i18next";
import CustomDropdown from "./Dropdown";
import { Shield } from "lucide-react";

export default function RoleField({ value, onChange, isRTL }) {
  const { t } = useTranslation();

  const roleOptions = [
    { value: "User", label: t("user") },
    { value: "Admin", label: t("admin") },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-2">
      <label className={`text-sm font-semibold ${isRTL ? "text-right" : "text-left"}`}>
        <span className="inline-flex items-center gap-2">
          <Shield size={16} className="text-gray-500" />
          {t("role")}
        </span>
      </label>

      <CustomDropdown value={value} onChange={onChange} options={roleOptions} />

      <div className={`text-xs text-gray-500 ${isRTL ? "text-right" : "text-left"}`}>
        {value === "Admin" ? t("adminPermissions") : t("userPermissions")}
      </div>
    </div>
  );
}
