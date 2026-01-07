import React from "react";
import Input from "../../components/UI/InputField";

export default function DateFields({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateError,
  endDateError,
  t,
  isRTL
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        type="date"
        label={t("startDate") + " *"}
        name="start_date"
        value={startDate}
        onChange={onStartDateChange}
        error={startDateError}
        isRTL= {isRTL}
      />
      
      <Input
        type="date"
        label={t("endDate") + " *"}
        name="end_date"
        value={endDate}
        onChange={onEndDateChange}
        error={endDateError}
        isRTL= {isRTL}
      />
    </div>
  );
}