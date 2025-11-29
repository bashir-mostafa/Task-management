import React, { useEffect } from "react";
import MessageComponent from "./MessageComponent";

export default function AutoCloseMessage({ 
  message, 
  onClose,
  duration = 5000,
  className = "" 
}) {
  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  return (
    <MessageComponent
      message={message}
      onClose={onClose}
      className={className}
    />
  );
}