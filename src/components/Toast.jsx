import React, { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-55 z-50">
      <div
        className={`
          px-4 py-3 rounded-lg shadow-lg text-white text-sm font-semibold
          animate-slide-in
          ${type === "success" ? "bg-green-500" : "bg-red-500"}
        `}
      >
        {message}
      </div>
    </div>
  );
}
