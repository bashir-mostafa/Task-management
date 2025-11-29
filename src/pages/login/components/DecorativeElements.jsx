// src/pages/login/components/DecorativeElements.jsx
import React from "react";

export default function DecorativeElements() {
  return (
    <>
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full animate-bounce"></div>
      <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-secondary/10 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 -right-8 w-12 h-12 bg-accent/10 rounded-full animate-ping"></div>
    </>
  );
}
