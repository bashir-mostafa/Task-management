import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, AlertTriangle } from "lucide-react";
import ConfirmationModal from "../UI/ConfirmationModal";

export default function LogoutButton({ 
  className = "", 
  variant = "default",
  icon = <LogOut size={18} />,
  showLabel = true 
}) {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = () => {
    logout();
    setShowPopup(false);
  };

  const variants = {
    default: "bg-red-500 hover:bg-red-600 text-white",
    sidebar: "bg-white/20 hover:bg-white/30 text-white",
    navbar: "bg-red-400 hover:bg-red-500 text-white",
    ghost: "bg-transparent hover:bg-red-500/20 text-red-500 hover:text-white"
  };

  const isRTL = i18n.language === "ar";

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className={`
          flex items-center gap-2 rounded-lg transition-all duration-300 
          font-medium text-sm
          ${variants[variant]} 
          ${className}
          ${showLabel ? 'px-4 py-2' : 'p-2 justify-center'}
        `}
        title={!showLabel ? t("logout") : ""}
      >
        {icon}
        {showLabel && <span>{t("logout")}</span>}
      </button>

      {showPopup && (
        <ConfirmationModal
          title={t("logoutConfirmation")}
          message={t("logoutMessage")}
          icon={<AlertTriangle size={24} className="text-red-500 dark:text-red-400" />}
          onConfirm={handleLogout}
          onCancel={() => setShowPopup(false)}
          confirmText={t("confirmLogout")}
          cancelText={t("cancel")}
          isRTL={isRTL}
        />
      )}
    </>
  );
}