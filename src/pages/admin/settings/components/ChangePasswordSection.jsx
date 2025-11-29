import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

import { changePassword } from "../services/AdminSettingService";

import PasswordField from "../../../../components/UI/PasswordField";
import ConfirmPasswordField from "../../../../components/UI/ConfirmPasswordField";
import PasswordRequirements from "../../../../components/UI/PasswordRequirements";
import PasswordStrengthIndicator from "../../../../components/UI/PasswordStrengthIndicator";
import Button from "../../../../components/UI/Button";
import ConfirmationModal from "../../../../components/UI/ConfirmationModal";
import MessageComponent from "../../../../components/UI/MessageComponent"; // الكومبوننت الجديد
import AutoCloseMessage from "../../../../components/UI/AutoCloseMessage";

export default function ChangePasswordSection({ isRTL }) {
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const passwordsMatch = newPassword && confirm && newPassword === confirm;

  const validate = () => {
    const newErrors = {};

    if (!oldPassword.trim()) newErrors.oldPassword = t("passwordRequired");

    if (!newPassword.trim()) newErrors.newPassword = t("passwordRequired");

    if (!confirm.trim()) newErrors.confirm = t("confirmPasswordRequired");
    else if (newPassword !== confirm)
      newErrors.confirm = t("passwordsNotMatch");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    setLoading(true);

    try {
      await changePassword({
        password: oldPassword,
        newpassword: newPassword,
      });

      setMessage({
        type: "success",
        text: t("passwordChangedSuccessfully"),
      });

      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err || t("errorOccurred"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
        {t("changePassword")}
      </h2>

      {/* استخدام الكومبوننت الجديد للرسائل */}
      <AutoCloseMessage
  message={message}
  onClose={() => setMessage(null)}
  duration={5000} // تختفي بعد 5 ثواني
  className="mb-4"
/>

      <form onSubmit={handleChangePassword} className="space-y-6">
        
        {/* كلمة المرور القديمة */}
        <PasswordField
          label={t("currentPassword")}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          showPassword={showOld}
          setShowPassword={setShowOld}
          placeholder={t("enterCurrentPassword")}
          error={errors.oldPassword}
          dir={isRTL ? "rtl" : "ltr"}
        />

        {/* كلمة المرور الجديدة */}
        <PasswordField
          label={t("newPassword")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          showPassword={showNew}
          setShowPassword={setShowNew}
          placeholder={t("enterNewPassword")}
          error={errors.newPassword}
          dir={isRTL ? "rtl" : "ltr"}
        />

        {/* قوة كلمة المرور */}
        <PasswordStrengthIndicator password={newPassword} isRTL={isRTL} />

        {/* شروط كلمة المرور */}
        <PasswordRequirements
          password={newPassword}
          confirmPassword={confirm}
          passwordsMatch={passwordsMatch}
          isRTL={isRTL}
        />

        <ConfirmPasswordField
          label={t("confirmPassword")}
          value={confirm}
          onChange={setConfirm}
          showPassword={showConfirm}
          onToggleShowPassword={() => setShowConfirm(!showConfirm)}
          isRTL={isRTL}
          placeholder={t("confirmNewPassword")}
          error={errors.confirm}
          passwordsMatch={passwordsMatch}
        />

        {/* زر الحفظ */}
        <Button type="submit" disabled={loading} className="w-full py-3 text-lg">
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="animate-pulse">{t("loading")}</span>
            </div>
          ) : (
            t("save")
          )}
        </Button>
      </form>

      {showModal && (
        <ConfirmationModal
          title={t("confirmPasswordChange")}
          message={t("areYouSureChangePassword")}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          confirmText={t("yesChange")}
          cancelText={t("cancel")}
          isRTL={isRTL}
        />
      )}
    </div>
  );
}