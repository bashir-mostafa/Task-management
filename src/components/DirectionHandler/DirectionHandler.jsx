// src/components/DirectionHandler/DirectionHandler.jsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AVAILABLE_THEMES = ['blue', 'green', 'purple', 'orange', 'pink'];
const DEFAULT_THEME = 'purple';

export default function DirectionHandler() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const applyTheme = () => {
      try {
        const savedDarkMode = localStorage.getItem('darkMode');
        const savedColorTheme = localStorage.getItem('colorTheme');
        
        const isDark = savedDarkMode === 'true';
        const colorTheme = savedColorTheme && AVAILABLE_THEMES.includes(savedColorTheme) 
          ? savedColorTheme 
          : DEFAULT_THEME;
        
        const root = document.documentElement;
        
        AVAILABLE_THEMES.forEach(theme => {
          root.classList.remove(`theme-${theme}`);
        });
        
        root.classList.add(`theme-${colorTheme}`);
        
        root.classList.remove('dark', 'light');
        root.classList.add(isDark ? 'dark' : 'light');
        
        
        
        return { isDark, colorTheme };
      } catch (error) {
        console.warn('Error applying theme:', error);
        return null;
      }
    };

    const updateDirection = () => {
      const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
      const lang = i18n.language;
      
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', lang);
      
      document.documentElement.classList.toggle('rtl', dir === 'rtl');
      document.documentElement.classList.toggle('ltr', dir === 'ltr');
      
    };

    applyTheme();
    
    updateDirection();
    
    setTimeout(() => {
      const root = document.documentElement;
      root.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
      
      document.body.classList.add('theme-loaded');
    }, 50);

    i18n.on('languageChanged', updateDirection);

    return () => {
      i18n.off('languageChanged', updateDirection);
    };
  }, [i18n]);

  return null;
}