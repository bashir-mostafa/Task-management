// src/components/UI/Card.jsx
import React from "react";

const Card = ({ 
  children, 
  className = "", 
  variant = "default", // default, outline, elevated, flat
  padding = "default", // default, none, sm, md, lg
  shadow = "default", // default, none, sm, md, lg
  border = "default", // default, none, sm, md
  hover = false,
  rounded = "default", // default, none, sm, md, lg, full
  ...props 
}) => {
  // Variant styles
  const variantStyles = {
    default: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
    outline: "bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white",
    elevated: "bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/30 text-gray-900 dark:text-white",
    flat: "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white",
  };

  // Padding styles
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    default: "p-4 md:p-6",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-10",
  };

  // Shadow styles
  const shadowStyles = {
    none: "",
    sm: "shadow-sm",
    default: "shadow-md",
    md: "shadow-lg",
    lg: "shadow-xl",
  };

  // Border radius styles
  const roundedStyles = {
    none: "rounded-none",
    sm: "rounded-sm",
    default: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
  };

  // Border styles
  const borderStyles = {
    none: "",
    sm: "border",
    default: "border border-gray-200 dark:border-gray-700",
    md: "border-2 border-gray-200 dark:border-gray-700",
  };

  // Hover effect
  const hoverStyles = hover 
    ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-1" 
    : "";

  const classes = [
    variantStyles[variant],
    paddingStyles[padding],
    shadowStyles[shadow],
    roundedStyles[rounded],
    borderStyles[border],
    hoverStyles,
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader = ({ 
  children, 
  className = "",
  title,
  subtitle,
  action,
  divider = false,
  ...props 
}) => {
  return (
    <div className={`${divider ? 'border-b border-gray-200 dark:border-gray-700' : ''} ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {children && !title && !subtitle && children}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </div>
  );
};

// Card Content Component
export const CardContent = ({ 
  children, 
  className = "",
  padding = "default", // none, sm, default, md, lg
  ...props 
}) => {
  const paddingStyles = {
    none: "",
    sm: "px-3 py-2",
    default: "px-4 py-3 md:px-6 md:py-4",
    md: "px-6 py-5 md:px-8 md:py-6",
    lg: "px-8 py-7 md:px-10 md:py-8",
  };

  return (
    <div className={`${paddingStyles[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter = ({ 
  children, 
  className = "",
  divider = true,
  align = "start", // start, center, end, between
  ...props 
}) => {
  const alignStyles = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  return (
    <div 
      className={`
        ${divider ? 'border-t border-gray-200 dark:border-gray-700' : ''} 
        ${alignStyles[align]} 
        flex items-center 
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
};

// Card Title Component
export const CardTitle = ({ 
  children, 
  className = "",
  level = 3, // 1-6
  ...props 
}) => {
  const Tag = `h${level}`;
  
  return (
    <Tag 
      className={`
        ${level === 1 ? 'text-2xl md:text-3xl font-bold' : ''}
        ${level === 2 ? 'text-xl md:text-2xl font-bold' : ''}
        ${level === 3 ? 'text-lg md:text-xl font-semibold' : ''}
        ${level === 4 ? 'text-base md:text-lg font-semibold' : ''}
        ${level === 5 ? 'text-base font-medium' : ''}
        ${level === 6 ? 'text-sm font-medium' : ''}
        text-gray-900 dark:text-white
        ${className}
      `}
      {...props}
    >
      {children}
    </Tag>
  );
};

// Card Description Component
export const CardDescription = ({ 
  children, 
  className = "",
  ...props 
}) => {
  return (
    <p 
      className={`text-sm text-gray-600 dark:text-gray-400 ${className}`} 
      {...props}
    >
      {children}
    </p>
  );
};

// Card Grid Component
export const CardGrid = ({ 
  children, 
  className = "",
  cols = 1, // 1-12
  gap = "default", // none, sm, default, md, lg
  ...props 
}) => {
  const gapStyles = {
    none: "gap-0",
    sm: "gap-2",
    default: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    12: "grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12",
  };

  return (
    <div 
      className={`
        grid 
        ${gridCols[cols] || gridCols[1]} 
        ${gapStyles[gap] || gapStyles.default} 
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
};

// Card Group Component
export const CardGroup = ({ 
  children, 
  className = "",
  direction = "vertical", // vertical, horizontal
  gap = "default",
  ...props 
}) => {
  const gapStyles = {
    none: "gap-0",
    sm: "gap-2",
    default: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div 
      className={`
        ${direction === "vertical" ? "flex flex-col" : "flex flex-col md:flex-row"} 
        ${gapStyles[gap] || gapStyles.default} 
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
};

// Card with Image Component
export const CardWithImage = ({ 
  children,
  imageSrc,
  imageAlt = "",
  imageHeight = "auto",
  imagePosition = "top", // top, bottom, left, right
  className = "",
  ...props 
}) => {
  const isHorizontal = imagePosition === "left" || imagePosition === "right";
  
  return (
    <div 
      className={`
        ${isHorizontal ? 'flex flex-col md:flex-row' : 'flex flex-col'} 
        ${className}
      `} 
      {...props}
    >
      {(imagePosition === "top" || imagePosition === "left") && imageSrc && (
        <div className={`
          ${isHorizontal ? 'md:w-1/3 flex-shrink-0' : ''}
          ${imagePosition === "left" ? 'md:order-first' : ''}
        `}>
          <img 
            src={imageSrc} 
            alt={imageAlt}
            className="w-full h-full object-cover"
            style={{ height: imageHeight }}
          />
        </div>
      )}
      
      <div className={isHorizontal ? 'md:w-2/3' : ''}>
        {children}
      </div>
      
      {(imagePosition === "bottom" || imagePosition === "right") && imageSrc && (
        <div className={`
          ${isHorizontal ? 'md:w-1/3 flex-shrink-0' : ''}
          ${imagePosition === "right" ? 'md:order-last' : ''}
        `}>
          <img 
            src={imageSrc} 
            alt={imageAlt}
            className="w-full h-full object-cover"
            style={{ height: imageHeight }}
          />
        </div>
      )}
    </div>
  );
};

// Card Stats Component
export const CardStats = ({ 
  title,
  value,
  change,
  changeType = "neutral", // positive, negative, neutral
  icon,
  className = "",
  ...props 
}) => {
  const changeColors = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  return (
    <Card className={className} {...props}>
      <CardContent padding="md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {value}
            </p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${changeColors[changeType]}`}>
                {changeType === "positive" && (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {changeType === "negative" && (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {change}
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Card Action Component
export const CardAction = ({ 
  children,
  href,
  onClick,
  className = "",
  variant = "default", // default, primary, secondary, outline
  fullWidth = false,
  disabled = false,
  ...props 
}) => {
  const variantStyles = {
    default: "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700",
    primary: "text-white bg-primary hover:bg-primary-dark",
    secondary: "text-white bg-secondary hover:bg-secondary-dark",
    outline: "text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
  };

  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 inline-flex items-center justify-center";

  const content = (
    <span className={`
      ${baseStyles}
      ${variantStyles[variant]}
      ${fullWidth ? 'w-full' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${className}
    `} 
    onClick={disabled ? undefined : onClick}
    {...props}
    >
      {children}
    </span>
  );

  if (href && !disabled) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }

  return content;
};

export default Card;

