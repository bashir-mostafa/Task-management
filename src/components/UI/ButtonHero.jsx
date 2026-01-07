// src/components/UI/ButtonHero.jsx
import React from "react";

export default function ButtonHero({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary", // primary, secondary, success, warning, danger, outline, ghost
  className = "",
  size = "md", // xs, sm, md, lg, xl
  isLoading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  isRTL = false,
  rounded = "lg", // none, sm, md, lg, full
  shadow = "sm", // none, sm, md, lg, xl
  ...props
}) {
  // حجم الأزرار
  const sizeClasses = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3.5 py-2.5 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-3.5 text-lg",
    xl: "px-6 py-4 text-xl",
  };

  // أنماط الزوايا
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // الظل
  const shadowClasses = {
    none: "shadow-none",
    sm: "shadow-sm hover:shadow",
    md: "shadow-md hover:shadow-lg",
    lg: "shadow-lg hover:shadow-xl",
    xl: "shadow-xl hover:shadow-2xl",
  };

  // أنماط الأزرار مع دعم الوضع الليلي
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 
      hover:from-blue-700 hover:to-blue-800
      dark:from-blue-700 dark:to-blue-800
      dark:hover:from-blue-800 dark:hover:to-blue-900
      text-white 
      border border-blue-500/20 dark:border-blue-600/30
      active:scale-[0.98] transition-all duration-200
    `,
    
    secondary: `
      bg-gradient-to-r from-gray-100 to-gray-200
      hover:from-gray-200 hover:to-gray-300
      dark:from-gray-800 dark:to-gray-900
      dark:hover:from-gray-700 dark:hover:to-gray-800
      text-gray-800 dark:text-gray-200
      border border-gray-300 dark:border-gray-700
      active:scale-[0.98] transition-all duration-200
    `,
    
    success: `
      bg-gradient-to-r from-green-600 to-green-700
      hover:from-green-700 hover:to-green-800
      dark:from-green-700 dark:to-green-800
      dark:hover:from-green-800 dark:hover:to-green-900
      text-white
      border border-green-500/20 dark:border-green-600/30
      active:scale-[0.98] transition-all duration-200
    `,
    
    warning: `
      bg-gradient-to-r from-orange-500 to-orange-600
      hover:from-orange-600 hover:to-orange-700
      dark:from-orange-600 dark:to-orange-700
      dark:hover:from-orange-700 dark:hover:to-orange-800
      text-white
      border border-orange-500/20 dark:border-orange-600/30
      active:scale-[0.98] transition-all duration-200
    `,
    
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-700 hover:to-red-800
      dark:from-red-700 dark:to-red-800
      dark:hover:from-red-800 dark:hover:to-red-900
      text-white
      border border-red-500/20 dark:border-red-600/30
      active:scale-[0.98] transition-all duration-200
    `,
    
    outline: `
      bg-transparent 
      hover:bg-gray-50 dark:hover:bg-gray-800/50
      text-gray-700 dark:text-gray-300
      border-2 border-gray-300 dark:border-gray-600
      hover:border-gray-400 dark:hover:border-gray-500
      active:scale-[0.98] transition-all duration-200
    `,
    
    ghost: `
      bg-transparent 
      hover:bg-gray-100 dark:hover:bg-gray-800
      text-gray-700 dark:text-gray-300
      border border-transparent
      hover:border-gray-200 dark:hover:border-gray-700
      active:scale-[0.98] transition-all duration-200
    `
  };

  // اتجاه الأيقونة بناءً على RTL
  const getIconPositionClass = () => {
    if (isRTL) {
      return iconPosition === "left" ? "ml-2" : "mr-2";
    }
    return iconPosition === "left" ? "mr-2" : "ml-2";
  };

  // محاذاة النص بناءً على RTL
  const getTextAlignmentClass = () => {
    if (isRTL) {
      return iconPosition === "left" ? "flex-row-reverse" : "";
    }
    return iconPosition === "right" ? "flex-row-reverse" : "";
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${roundedClasses[rounded]}
        ${shadowClasses[shadow]}
        font-medium font-sans
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:transform-none
        flex items-center justify-center
        ${fullWidth ? 'w-full' : ''}
        ${getTextAlignmentClass()}
        ${className}
      `}
      aria-busy={isLoading}
      {...props}
    >
      {/* مؤشر التحميل */}
      {isLoading && (
        <svg 
          className={`animate-spin h-4 w-4 ${getIconPositionClass()}`}
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {/* الأيقونة */}
      {!isLoading && Icon && (
        <Icon 
          size={
            size === 'xs' ? 12 : 
            size === 'sm' ? 14 : 
            size === 'md' ? 16 : 
            size === 'lg' ? 18 : 20
          } 
          className={getIconPositionClass()}
          aria-hidden="true"
        />
      )}
      
      {/* النص */}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}

// مكون ثانوي للاستخدام مع RTL
export function RTLButton({ isRTL = false, ...props }) {
  return <ButtonHero isRTL={isRTL} {...props} />;
}

// مكون ثانوي للاستخدام مع الوضع الليلي
export function DarkModeButton({ darkMode = true, ...props }) {
  return <ButtonHero {...props} />;
}