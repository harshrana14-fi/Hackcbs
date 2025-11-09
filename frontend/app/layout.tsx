import type { Metadata } from "next";
import "./globals.css";
import LanguageProviderWrapper from "@/components/LanguageProviderWrapper";

export const metadata: Metadata = {
  title: "Digital Voting System | Election Commission of India",
  description: "Official digital voting platform of the Election Commission of India. Secure, transparent, and accessible voting for all citizens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Noto+Serif:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <LanguageProviderWrapper>
          {children}
        </LanguageProviderWrapper>
      </body>
    </html>
  );
}
