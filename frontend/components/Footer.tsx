"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  ChevronDown,
  ExternalLink,
  FileText,
  Shield,
  Users,
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

  return (
    <footer className="bg-[#002147] text-white border-t-4 border-[#FF9933]">
      {/* Top Section with Tricolor */}
      <div className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] h-2"></div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-[#FF9933] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#002147]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Election Commission</h3>
                <p className="text-xs text-white/80">भारत निर्वाचन आयोग</p>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              Official digital voting platform of the Election Commission of India. 
              Secure, transparent, and accessible voting for all citizens.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs bg-white/10 rounded-full border border-white/20">
                ISO 27001
              </span>
              <span className="px-3 py-1 text-xs bg-white/10 rounded-full border border-white/20">
                Certified
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> Home
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> How It Works
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> Register to Vote
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> Voter Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Important Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> Voter Guidelines
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> FAQ
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-white/80 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span>→</span> Accessibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Language */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Us
            </h3>
            <div className="space-y-3 text-sm mb-6">
              <a
                href="mailto:support@eci.gov.in"
                className="flex items-center gap-2 text-white/80 hover:text-[#FF9933] transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@eci.gov.in
              </a>
              <a
                href="tel:1800111363"
                className="flex items-center gap-2 text-white/80 hover:text-[#FF9933] transition-colors"
              >
                <Phone className="w-4 h-4" />
                1800-11-1363
              </a>
              <div className="flex items-start gap-2 text-white/80">
                <MapPin className="w-4 h-4 mt-1" />
                <div>
                  <div>Nirvachan Sadan,</div>
                  <div>Ashoka Road, New Delhi - 110001</div>
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Select Language
              </h4>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded text-sm text-white hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{currentLanguage.nativeName}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isLanguageDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-full max-h-64 overflow-y-auto bg-[#003A6B] border border-white/20 rounded shadow-xl z-50">
                    <div className="p-2">
                      {languages.map((lang) => {
                        if (!lang || !lang.code) return null;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                              language === lang.code
                                ? "bg-[#FF9933] text-[#002147] font-semibold"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{lang.nativeName}</div>
                                <div className="text-xs opacity-70">{lang.name}</div>
                              </div>
                              {language === lang.code && (
                                <svg
                                  className="w-4 h-4"
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
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/80">
            <div className="flex flex-wrap items-center gap-4">
              <span>© {new Date().getFullYear()} Election Commission of India. All Rights Reserved.</span>
              <span className="hidden md:inline">|</span>
              <span>भारत निर्वाचन आयोग</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/accessibility" className="hover:text-[#FF9933] transition-colors flex items-center gap-1">
                <span>Accessibility Statement</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <span className="hidden md:inline">|</span>
              <Link href="/security" className="hover:text-[#FF9933] transition-colors flex items-center gap-1">
                <span>Security & Privacy</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="mt-4 text-xs text-white/60 text-center">
            This is an official website of the Election Commission of India | 
            This website is best viewed in Chrome, Firefox, Edge browsers
          </div>
        </div>
      </div>
    </footer>
  );
}
