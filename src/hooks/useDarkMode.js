// src/hooks/useDarkMode.js
import { useEffect, useState } from 'react';

const AVAILABLE_THEMES = ['blue', 'green', 'purple', 'orange', 'pink'];
const DEFAULT_THEME = 'blue';

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true';
    } catch (error) {
      console.warn('Error accessing localStorage for darkMode:', error);
      return false;
    }
  });

  const [colorTheme, setColorTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('colorTheme');
      return AVAILABLE_THEMES.includes(saved) ? saved : DEFAULT_THEME;
    } catch (error) {
      console.warn('Error accessing localStorage for colorTheme:', error);
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    
    try {
      // إزالة جميع كلاسات الألوان القديمة
      AVAILABLE_THEMES.forEach(theme => {
        root.classList.remove(`theme-${theme}`);
      });
      
      // إضافة الكلاس الجديد للون
      root.classList.add(`theme-${colorTheme}`);
      
      // تطبيق الوضع الداكن أو الفاتح
      root.classList.remove('dark', 'light');
      root.classList.add(isDark ? 'dark' : 'light');

      // حفظ التفضيلات
      localStorage.setItem('darkMode', isDark);
      localStorage.setItem('colorTheme', colorTheme);
    } catch (error) {
      console.warn('Error applying theme or saving to localStorage:', error);
    }
  }, [isDark, colorTheme]);

  const changeColorTheme = (theme) => {
    if (AVAILABLE_THEMES.includes(theme)) {
      setColorTheme(theme);
      // تم حذف حفظ localStorage هنا لأن useEffect سيتكفل بذلك
    } else {
      console.warn(`Invalid theme: ${theme}. Using default theme.`);
      setColorTheme(DEFAULT_THEME);
    }
  };

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  return {
    isDark,
    setIsDark,
    colorTheme,
    changeColorTheme,
    toggleDarkMode,
    availableThemes: AVAILABLE_THEMES
  };
}