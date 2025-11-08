"use client";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageModal from "@/components/LanguageModal";

export default function LanguageProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <LanguageModal />
      {children}
    </LanguageProvider>
  );
}

