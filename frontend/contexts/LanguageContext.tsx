"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = 
  | "en" // English
  | "hi" // Hindi
  | "mr" // Marathi
  | "te" // Telugu
  | "ta" // Tamil
  | "bn" // Bengali
  | "gu" // Gujarati
  | "kn" // Kannada
  | "ml" // Malayalam
  | "or" // Odia
  | "pa" // Punjabi
  | "ur"; // Urdu

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Import translations - using dynamic import to avoid SSR issues
let translationsData: any = null;

const getTranslations = () => {
  if (translationsData) {
    return translationsData;
  }
  
  // Use dynamic import only on client side
  if (typeof window !== "undefined") {
    import("@/translations").then((module) => {
      translationsData = module.default;
    }).catch((err) => {
      console.error("Failed to load translations:", err);
    });
  }
  
  return translationsData || {};
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<any>(() => {
    // Initialize with empty object, will load on client
    if (typeof window !== "undefined") {
      return getTranslations();
    }
    return {};
  });

  useEffect(() => {
    // Load translations on client side
    if (typeof window !== "undefined") {
      import("@/translations")
        .then((module) => {
          setTranslations(module.default || {});
        })
        .catch((error) => {
          console.error("Failed to load translations:", error);
        });
      
      // Check if language preference is stored
      const savedLanguage = localStorage.getItem("preferredLanguage") as Language;
      if (savedLanguage) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", lang);
    }
  };

  const t = (key: string): string => {
    // If translations haven't loaded yet, return the key
    if (!translations) {
      return key;
    }
    
    const keys = key.split(".");
    let value: any = translations[language];
    
    if (!value) {
      // Fallback to English
      value = translations.en || {};
    }
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

