"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Globe, X } from "lucide-react";

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
];

export default function LanguageModal() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  useEffect(() => {
    // Check if user has already selected a language
    if (typeof window !== "undefined") {
      const hasSelectedLanguage = localStorage.getItem("preferredLanguage");
      if (!hasSelectedLanguage) {
        // Show modal if no language preference is stored
        setIsOpen(true);
      }
    }
  }, []);

  const handleContinue = () => {
    setLanguage(selectedLang);
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", selectedLang);
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("languageModal.title")}</h2>
                      <p className="text-indigo-100 text-sm mt-1">{t("languageModal.subtitle")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Language Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <motion.button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedLang === lang.code
                          ? "border-indigo-600 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-lg mb-1">
                        {lang.nativeName}
                      </div>
                      <div className="text-sm text-gray-600">{lang.name}</div>
                      {selectedLang === lang.code && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2 flex items-center gap-1 text-indigo-600 text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {t("languageModal.selectLanguage")}
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
                <motion.button
                  onClick={handleContinue}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {t("languageModal.continue")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

