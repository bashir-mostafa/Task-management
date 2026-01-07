import React from "react";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/UI/Button";

export default function PageHeader({
  title,
  subtitle,
  backButtonText,
  backButtonPath,
  children,
  isRTL = false,
}) {

  return (
    <div className=" mb-8">
      <div className={`flex justify-between ml-100 gap-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
        <div>
          {backButtonPath && (
            <Button
              onClick={backButtonPath}
              variant="secondary"
              className={`flex items-center gap-2 w-10 h-10 px-4 py-2 `}>
              <ArrowLeft size={20} />
              <span>{backButtonText}</span>
            </Button>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
