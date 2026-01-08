// src/hooks/useDarkMode.js
import { useEffect, useState, useCallback } from 'react';

const AVAILABLE_THEMES = ['blue', 'green', 'purple', 'orange', 'pink'];
const DEFAULT_THEME = 'purple';

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [colorTheme, setColorTheme] = useState(DEFAULT_THEME);
  const [isReady, setIsReady] = useState(false);

  // دالة لتطبيق المود فوراً
  const applyTheme = useCallback((theme, darkMode) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    
    // إزالة جميع كلاسات الألوان القديمة
    AVAILABLE_THEMES.forEach(t => {
      root.classList.remove(`theme-${t}`);
    });
    
    // إضافة الكلاس الجديد للون
    root.classList.add(`theme-${theme}`);
    
    // تطبيق الوضع الداكن أو الفاتح
    root.classList.remove('dark', 'light');
    root.classList.add(darkMode ? 'dark' : 'light');
    
    // تطبيق مباشر على الـ body لمنع الوميض (flash)
    if (darkMode) {
      root.style.backgroundColor = '#111827'; // gray-900
      root.style.color = '#f9fafb'; // gray-50
    } else {
      root.style.backgroundColor = '#ffffff';
      root.style.color = '#111827'; // gray-900
    }
  }, []);

  // تهيئة المود مرة واحدة عند التحميل
  useEffect(() => {
    console.log('🎨 Initializing theme from localStorage...');
    
    try {
      // قراءة darkMode - استخدام القيمة المباشرة من localStorage
      const savedDarkMode = localStorage.getItem('darkMode');
      const initialDarkMode = savedDarkMode === 'true';
      
      // قراءة colorTheme
      const savedColorTheme = localStorage.getItem('colorTheme');
      const initialColorTheme = savedColorTheme && AVAILABLE_THEMES.includes(savedColorTheme) 
        ? savedColorTheme 
        : DEFAULT_THEME;
      
      // تطبيق المود فوراً قبل تحديث state
      applyTheme(initialColorTheme, initialDarkMode);
      
      // تحديث state بعد التطبيق
      setIsDark(initialDarkMode);
      setColorTheme(initialColorTheme);
      
      console.log('✅ Theme applied immediately:', {
        theme: initialColorTheme,
        darkMode: initialDarkMode
      });
      
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
      // تطبيق المود الافتراضي في حالة الخطأ
      applyTheme(DEFAULT_THEME, false);
    }
    
    setIsReady(true);
    
    // تنظيف تأثير الـ style المباشر بعد تحميل الكلاسات
    setTimeout(() => {
      const root = window.document.documentElement;
      root.style.backgroundColor = '';
      root.style.color = '';
    }, 100);
    
  }, [applyTheme]);

  // تأثير لتطبيق المود عند التغيير
  useEffect(() => {
    if (!isReady) return;
    
    console.log('🎨 Applying theme on change:', { isDark, colorTheme });
    
    applyTheme(colorTheme, isDark);
    
    // حفظ التفضيلات
    try {
      localStorage.setItem('darkMode', isDark);
      localStorage.setItem('colorTheme', colorTheme);
      console.log('💾 Saved to localStorage:', { darkMode: isDark, colorTheme });
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }
  }, [isDark, colorTheme, isReady, applyTheme]);

  const changeColorTheme = (theme) => {
    if (AVAILABLE_THEMES.includes(theme)) {
      setColorTheme(theme);
      console.log('Theme changed to:', theme);
    } else {
      console.warn(`Invalid theme: ${theme}. Using default theme.`);
      setColorTheme(DEFAULT_THEME);
    }
  };

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  const setDarkMode = (value) => {
    setIsDark(value);
  };

  return {
    isDark,
    setIsDark: setDarkMode,
    colorTheme,
    changeColorTheme,
    toggleDarkMode,
    availableThemes: AVAILABLE_THEMES,
    isReady
  };
}