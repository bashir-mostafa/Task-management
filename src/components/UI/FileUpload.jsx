// src/components/UI/FileUpload.jsx
import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import ButtonHero from './ButtonHero';

const FileUpload = ({
  onFileSelect,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  buttonText = 'رفع ملف',
  buttonVariant = 'outline',
  isRTL = false,
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize) {
      setError(`حجم الملف كبير جداً (الحد الأقصى: ${maxSize / (1024 * 1024)}MB)`);
      return;
    }

    // Check file type if accept is specified
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      if (!acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(new RegExp(type.replace('*', '.*')));
      })) {
        setError('نوع الملف غير مدعوم');
        return;
      }
    }

    setError('');
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile && onFileSelect) {
      onFileSelect(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      {selectedFile ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
              <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRemove}
              className="p-1 text-gray-400 hover:text-red-500"
              title="إزالة">
              <X size={16} />
            </button>
            <ButtonHero
              onClick={handleUpload}
              variant="primary"
              size="sm"
              isRTL={isRTL}>
              رفع
            </ButtonHero>
          </div>
        </div>
      ) : (
        <ButtonHero
          onClick={() => fileInputRef.current?.click()}
          variant={buttonVariant}
          size="sm"
          isRTL={isRTL}
          icon={Upload}
          iconPosition={isRTL ? "right" : "left"}>
          {buttonText}
        </ButtonHero>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;