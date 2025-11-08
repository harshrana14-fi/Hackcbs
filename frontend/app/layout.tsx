import type { Metadata } from "next";
import "./globals.css";
import LanguageProviderWrapper from "@/components/LanguageProviderWrapper";

export const metadata: Metadata = {
  title: "Secure Digital Voting Platform",
  description: "A government-grade decentralized voting system ensuring transparency, security, and accessibility for all citizens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LanguageProviderWrapper>
          {children}
        </LanguageProviderWrapper>
      </body>
    </html>
  );
}
