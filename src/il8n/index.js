// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import ku from "../locales/ku.json";

// دالة لتعيين الاتجاه بناءً على اللغة
const setDocumentDirection = (lng) => {
  const direction = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", direction);
  document.documentElement.setAttribute("lang", lng);
  document.documentElement.classList.toggle("rtl", lng === "ar");
};

// استرجاع اللغة المحفوظة أو استخدام اللغة الافتراضية
const savedLanguage = localStorage.getItem("language") || "ar";

// تطبيق الإعدادات الأولية
setDocumentDirection(savedLanguage);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    ku: { translation: ku },
  },
  lng: savedLanguage,
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

// الاستماع لتغيير اللغة وتحديث الاتجاه
i18n.on("languageChanged", (lng) => {
  setDocumentDirection(lng);
  localStorage.setItem("language", lng);
});

i18n.on("languageChanged", (lng) => {
  setDocumentDirection(lng);
  localStorage.setItem("language", lng);

  // تغيير عنوان الصفحة حسب الترجمة
  document.title = i18n.t("appTitle");
});
document.title = i18n.t("appTitle");


export default i18n;
