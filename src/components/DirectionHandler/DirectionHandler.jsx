// src/components/DirectionHandler/DirectionHandler.jsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function DirectionHandler() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const updateDirection = () => {
      const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
      const lang = i18n.language;
      
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.classList.toggle('rtl', dir === 'rtl');
      document.documentElement.classList.toggle('ltr', dir === 'ltr');
    };

    updateDirection(); 

    i18n.on('languageChanged', updateDirection);

    return () => {
      i18n.off('languageChanged', updateDirection);
    };
  }, [i18n]);

  return null;
}