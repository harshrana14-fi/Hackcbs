"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Menu, X, ShieldCheck, Home, FileText, Users, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = useMemo(
    () => [
      { label: t("navbar.home"), href: "/", icon: Home },
      { label: t("navbar.howItWorks"), href: "#how-it-works", icon: FileText },
      { label: t("navbar.features"), href: "#features", icon: ShieldCheck },
      { label: t("navbar.about"), href: "/about", icon: Users },
      { label: t("navbar.contact"), href: "/contact", icon: Phone },
    ],
    [t]
  );

  return (
    <>
      {/* Official Government Header Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] h-3 border-b-2 border-[#002147]">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-end">
          <div className="text-[10px] font-semibold text-[#002147] hidden md:block">
            भारत सरकार | Government of India
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`fixed top-3 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#002147] shadow-lg border-b-2 border-[#FF9933]"
            : "bg-[#003A6B] border-b-2 border-[#FF9933]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Bar with Official Info */}
          <div className="hidden md:flex items-center justify-between py-2 text-xs text-white/80 border-b border-white/20">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>support@eci.gov.in</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>1800-11-1363</span>
              </span>
            </div>
            <div className="text-xs font-medium">
              Last Updated: {new Date().toLocaleDateString('en-IN')}
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex items-center justify-between h-20">
            {/* Logo Section with Ashoka Chakra */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative">
                {/* Ashoka Chakra Emblem */}
                <div className="w-16 h-16 rounded-full bg-white border-4 border-[#002147] flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 rounded-full border-2 border-[#002147] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#002147]">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 2 L12 22 M2 12 L22 12" stroke="currentColor" strokeWidth="1"/>
                        <circle cx="12" cy="12" r="2" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="leading-tight">
                <div className="text-xl font-bold text-white group-hover:text-[#FF9933] transition-colors">
                  Digital Voting System
                </div>
                <div className="text-xs text-white/80 uppercase tracking-wider">
                  Election Commission of India
                </div>
                <div className="text-[10px] text-white/60">
                  भारत निर्वाचन आयोग
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded transition-all border-b-2 border-transparent hover:border-[#FF9933]"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/30 rounded hover:bg-white/10 transition-all"
              >
                {t("navbar.login")}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold bg-[#FF9933] text-[#002147] rounded hover:bg-[#FFB366] transition-all shadow-md"
              >
                {t("Navbar")}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded transition-all"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-[#002147] border-t border-white/20">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded transition-all border-l-4 border-transparent hover:border-[#FF9933]"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-white/20 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-center text-white border-2 border-white/30 rounded hover:bg-white/10 transition-all font-semibold"
                >
                  {t("navbar.login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-center bg-[#FF9933] text-[#002147] rounded hover:bg-[#FFB366] transition-all font-semibold shadow-md"
                >
                  {t("navbar.register")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
