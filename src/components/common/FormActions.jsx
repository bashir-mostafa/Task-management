import React from "react";
import Button from "../../components/UI/Button";

export default function FormActions({
  isRTL = false,
  onSubmit,
  onCancel,
  submitText = "حفظ التغييرات",
  cancelText = "إلغاء",
  submitting = false,
  submitIcon,
  showSaveButton = true,
  showCancelButton = true
}) {
  return (
    <div className={`flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 ${isRTL ? "flex-row-reverse" : ""}`}>
      {showCancelButton && (
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          disabled={submitting}
          className="!w-auto px-6 py-3"
        >
          {cancelText}
        </Button>
      )}
      
      {showSaveButton && (
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={submitting}
          className={`flex items-center gap-2 !w-auto px-6 py-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            submitIcon
          )}
          <span>{submitting ? "جاري الحفظ..." : submitText}</span>
        </Button>
      )}
    </div>
  );
}