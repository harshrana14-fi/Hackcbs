"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Twitter,
  Linkedin,
  Mail,
  Phone,
  ShieldCheck,
  ArrowUp,
  Instagram,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";

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

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsLanguageDropdownOpen(false);
  };
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      {/* Decorative top wave */}
      <div className="absolute inset-x-0 -top-14 h-14">
        <svg
          viewBox="0 0 1440 200"
          className="h-full w-full text-slate-950"
          preserveAspectRatio="none"
        >
          <path
            d="M0,160 C240,80 480,0 720,40 C960,80 1200,200 1440,120 L1440,200 L0,200 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-10 top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-semibold text-white">{t("VoteChain")}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("National Digital Voting Portal")}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {t("Building a transparent, inclusive, and secure digital democracy. VoteChain leverages blockchain infrastructure, biometric verification, and national security standards to protect every ballot.")}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="rounded-full border border-slate-700/60 px-3 py-1">{t("ISO 27001 Certified")}</span>
              <span className="rounded-full border border-slate-700/60 px-3 py-1">{t("Zero Knowledge Audits")}</span>
              <span className="rounded-full border border-slate-700/60 px-3 py-1">{t("24/7 Support Desk")}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">{t("QuickLinks")}</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <Link href="/" className="transition hover:text-indigo-400">{t("common.home")}</Link>
              <Link href="#how-it-works" className="transition hover:text-indigo-400">{t("navbar.howItWorks")}</Link>
              <Link href="#features" className="transition hover:text-indigo-400">{t("navbar.features")}</Link>
              <Link href="/about" className="transition hover:text-indigo-400">{t("footer.aboutVoteChain")}</Link>
              <Link href="/contact" className="transition hover:text-indigo-400">{t("navbar.contact")}</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">{t("Resources")}</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <Link href="/privacy" className="transition hover:text-indigo-400">{t("privacyPolicy")}</Link>
              <Link href="/terms" className="transition hover:text-indigo-400">{t("termsConditions")}</Link>
              <Link href="/support" className="transition hover:text-indigo-400">{t("supportCentre")}</Link>
              <Link href="/faq" className="transition hover:text-indigo-400">{t("faq")}</Link>
              <Link href="/guidelines" className="transition hover:text-indigo-400">{t("voterGuidelines")}</Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">{t("Contact")}</h3>
            <div className="mt-4 space-y-3 text-sm">
              <a
                href="mailto:support@votechain.gov"
                className="flex items-center gap-3 transition hover:text-indigo-400"
              >
                <Mail className="h-4 w-4" /> support@votechain.gov
              </a>
              <a
                href="tel:+1800123456"
                className="flex items-center gap-3 transition hover:text-indigo-400"
              >
                <Phone className="h-4 w-4" /> +91 XXXXXXXXXX
              </a>
            </div>
            
            {/* Language Selector */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-3">{t("Language")}</h3>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-300 transition hover:border-indigo-500 hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">{currentLanguage.nativeName}</span>
                    <span className="text-xs text-slate-500">({currentLanguage.name})</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isLanguageDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {isLanguageDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full max-h-64 overflow-y-auto rounded-lg border border-slate-700/60 bg-slate-900 shadow-xl z-50">
                    <div className="p-2">
                      {languages.map((lang) => {
                        // Ensure all languages including English are visible
                        if (!lang || !lang.code) return null;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition ${
                              language === lang.code
                                ? "bg-indigo-600/20 text-indigo-400"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{lang.nativeName}</div>
                                <div className="text-xs text-slate-500">{lang.name}</div>
                              </div>
                              {language === lang.code && (
                                <svg
                                  className="h-4 w-4 text-indigo-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-4 text-slate-400">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 transition hover:border-indigo-500 hover:text-indigo-400"
                aria-label="VoteChain on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 transition hover:border-indigo-500 hover:text-indigo-400"
                aria-label="VoteChain on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 transition hover:border-indigo-500 hover:text-indigo-400"
                aria-label="VoteChain on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {t("footer.brand")}. {t("footer.copyright")}</p>
          <div className="flex items-center gap-4">
            <Link href="/accessibility" className="transition hover:text-indigo-400">{t("footer.accessibilityStatement")}</Link>
            <Link href="/security" className="transition hover:text-indigo-400">{t("footer.securityCompliance")}</Link>
            <Link href="/status" className="transition hover:text-indigo-400">{t("footer.systemStatus")}</Link>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500 px-4 py-2 text-indigo-300 transition hover:bg-indigo-500/10"
          >
            <ArrowUp className="h-4 w-4" />
            {t("footer.backToTop")}
          </button>
        </div>
      </div>
    </footer>
  );
}
