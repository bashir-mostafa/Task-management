// src/hooks/useDarkMode.js
// (لم تغير، لكنه يعمل جيداً)
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
      AVAILABLE_THEMES.forEach(theme => {
        root.classList.remove(`theme-${theme}`);
      });
      
      root.classList.add(`theme-${colorTheme}`);
      
      root.classList.remove('dark', 'light');
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }

      localStorage.setItem('darkMode', isDark);
      localStorage.setItem('colorTheme', colorTheme);
    } catch (error) {
      console.warn('Error applying theme or saving to localStorage:', error);
    }
  }, [isDark, colorTheme]);

  const changeColorTheme = (theme) => {
    if (AVAILABLE_THEMES.includes(theme)) {
      setColorTheme(theme);
      localStorage.setItem('colorTheme', theme);
      // أعد تحميل الصفحة بعد تغيير اللون لتطبيق الثيم بشكل كامل
      setTimeout(() => {
        window.location.reload();
      }, 150);
    } else {
      console.warn(`Invalid theme: ${theme}. Using default theme.`);
      setColorTheme(DEFAULT_THEME);
      localStorage.setItem('colorTheme', DEFAULT_THEME);
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  };
  

  return {
    isDark,
    setIsDark,
    colorTheme,
    changeColorTheme,
    toggleDarkMode: () => setIsDark(!isDark)
  }; 
}