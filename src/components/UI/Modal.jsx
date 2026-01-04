// src/components/UI/Modal.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X } from "lucide-react";
import useDarkMode from "../../hooks/useDarkMode";
import { useTranslation } from "react-i18next";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = "",
}) => {
  const { isDark } = useDarkMode();
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef(null);
  const isRTL = i18n.language === "ar";

  // حجم المودال
  const sizeClasses = useMemo(() => {
    switch (size) {
      case "sm":
        return "max-w-md";
      case "md":
        return "max-w-lg";
      case "lg":
        return "max-w-2xl";
      case "xl":
        return "max-w-4xl";
      case "full":
        return "max-w-full mx-4";
      default:
        return "max-w-lg";
    }
  }, [size]);

  // التحكم في ظهور واختفاء المودال مع تأثيرات
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // إغلاق المودال عند الضغط على ESC
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isVisible, handleKeyDown]);

  // النقر خارج المودال لإغلاقه
  const handleOverlayClick = useCallback(
    (event) => {
      if (
        closeOnOverlayClick &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // إذا لم يكن المودال مفتوحاً، لا نعيد شيء
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating
          ? "opacity-100 visible"
          : "opacity-0 invisible"
      }`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses} bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isAnimating
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
        } ${className}`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2
              id="modal-title"
              className={`text-xl font-bold text-gray-800 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  isRTL ? "mr-auto" : "ml-auto"
                }`}
                aria-label={t("close")}
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;