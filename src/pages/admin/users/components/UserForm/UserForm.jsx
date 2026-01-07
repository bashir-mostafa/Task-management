// UserForm.jsx - التصميم الأفقي
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import InputField from "../../../../../components/UI/InputField";
import PasswordField from "../../../../../components/UI/PasswordField";
import ConfirmPasswordField from "../../../../../components/UI/ConfirmPasswordField";
import RoleField from "../../../../../components/UI/RoleField";
import FormActions from "../../../../../components/UI/FormActions";
import PasswordStrengthIndicator from "../../../../../components/UI/PasswordStrengthIndicator";
import PasswordRequirements from "../../../../../components/UI/PasswordRequirements";

export default function UserForm({
  user,
  onSubmit,
  onClose,
  isSubmitting,
  isRTL,
}) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        role: user.role || "User",
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "User",
      });
    }
    setErrors({});
  }, [user]);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validatePassword = (password) => {
    if (password.length < 8) return t("passwordMinLength");
    if (!/\d/.test(password)) return t("passwordNumberRequired");
    if (!/[a-zA-Z]/.test(password)) return t("passwordLetterRequired");
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    if (isEditing) {
      if (formData.password) {
        const pError = validatePassword(formData.password);
        if (pError) newErrors.password = pError;

        if (!formData.confirmPassword)
          newErrors.confirmPassword = t("confirmPasswordRequired");
        else if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = t("passwordsNotMatch");
      }
    } else {
      if (!formData.username.trim()) newErrors.username = t("usernameRequired");
      else if (formData.username.length < 2)
        newErrors.username = t("usernameMinLength");

      if (!formData.email.trim()) newErrors.email = t("emailRequired");
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = t("invalidEmail");

      if (!formData.password) newErrors.password = t("passwordRequired");
      else {
        const pError = validatePassword(formData.password);
        if (pError) newErrors.password = pError;
      }

      if (!formData.confirmPassword)
        newErrors.confirmPassword = t("confirmPasswordRequired");
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = t("passwordsNotMatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      let submitData;
      if (isEditing) {
        submitData = {
          id: user.id,
          ...(formData.password && { password: formData.password }),
        };
      } else {
        submitData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
      }
      onSubmit(submitData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4"
      dir={isRTL ? "rtl" : "ltr"}>
      {/* معلومات المستخدم في وضع التعديل - تصميم مضغوط */}
      {isEditing && user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
            {t("userInformation")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <div className="font-medium text-blue-700 dark:text-blue-400">
                {t("username")}
              </div>
              <div className="text-blue-900 dark:text-blue-200 truncate">
                {user.username}
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-700 dark:text-blue-400">
                {t("email")}
              </div>
              <div className="text-blue-900 dark:text-blue-200 truncate">
                {user.email}
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-700 dark:text-blue-400">
                {t("role")}
              </div>
              <div className="text-blue-900 dark:text-blue-200">
                {user.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* حقول الإضافة - تصميم أفقي */}
      {!isEditing && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            {t("userDetails")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <InputField
                label={t("username")}
                placeholder={t("enterUsername")}
                value={formData.username}
                onChange={(e) => setField("username", e.target.value)}
                error={errors.username}
                dir={isRTL ? "rtl" : "ltr"}
                size="sm"
              />
            </div>
            <div className="space-y-2">
              <InputField
                label={t("email")}
                placeholder={t("enterEmail")}
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                error={errors.email}
                dir={isRTL ? "rtl" : "ltr"}
                size="sm"
              />
            </div>
            <div className="sm:col-span-2">
              <RoleField
                value={formData.role}
                onChange={(v) => setField("role", v)}
                isRTL={isRTL}
                size="sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* قسم كلمة المرور - تصميم أفقي */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
          {isEditing ? t("updatePassword") : t("setPassword")}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <PasswordField
              label={isEditing ? t("newPassword") : t("password")}
              value={formData.password}
              placeholder={
                isEditing ? t("enterNewPassword") : t("enterPassword")
              }
              onChange={(e) => setField("password", e.target.value)}
              error={errors.password}
              dir={isRTL ? "rtl" : "ltr"}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              required={!isEditing}
              size="sm"
            />

            {formData.password && (
              <div className="mt-2">
                <PasswordStrengthIndicator
                  password={formData.password}
                  isRTL={isRTL}
                  compact={true}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <ConfirmPasswordField
              label={isEditing ? t("confirmNewPassword") : t("confirmPassword")}
              value={formData.confirmPassword}
              placeholder={
                isEditing
                  ? t("enterConfirmNewPassword")
                  : t("enterConfirmPassword")
              }
              onChange={(v) => setField("confirmPassword", v)}
              error={errors.confirmPassword}
              isRTL={isRTL}
              passwordsMatch={passwordsMatch}
              showPassword={showConfirmPassword}
              onToggleShowPassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              required={!isEditing}
            />

            {formData.password && formData.confirmPassword && (
              <div className="mt-2">
                <PasswordRequirements
                  password={formData.password}
                  confirmPassword={formData.confirmPassword}
                  passwordsMatch={passwordsMatch}
                  isRTL={isRTL}
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
            {t("passwordUpdateOptional")}
          </p>
        )}
      </div>

      {/* Form Actions - أفقي ومضغوط */}
      <FormActions
        onClose={onClose}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        isRTL={isRTL}
        submitText={isEditing ? t("updatePassword") : t("createUser")}
        horizontal={true}
      />
    </form>
  );
}
