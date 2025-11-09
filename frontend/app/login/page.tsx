"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loginAPI } from "../api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Vote } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const [voterId, setVoterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate the voter ID
      const response = await loginAPI.validateVoterId(voterId);
      
      // Store voter ID in localStorage for session management
      localStorage.setItem("voterId", voterId);
      
      // Store user ID if available in response
      if (response.user && response.user.id) {
        localStorage.setItem("userId", response.user.id);
      }
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />
      <main className="pt-32 pb-12 px-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-white rounded border border-[#E0E0E0] shadow-md govt-card">
            <div className="px-8 py-10">
              {/* Official Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-[#002147] flex items-center justify-center shadow-lg mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#002147]" />
                </div>
                <h1 className="text-3xl font-bold text-[#002147] mb-2 govt-heading">
                  {t("login.welcomeBack")}
                </h1>
                <p className="text-[#4A4A4A] font-medium">{t("login.loginWithVoterId")}</p>
                <div className="mt-2 text-xs text-[#4A4A4A]">
                  भारत निर्वाचन आयोग | Election Commission of India
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border-2 border-red-200 p-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#002147] mb-2">
                    {t("login.voterId")} *
                  </label>
                  <input
                    type="text"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                    placeholder="e.g., VCUP000025NHCVPU5"
                    className="w-full px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                    required
                  />
                  <p className="mt-2 text-xs text-[#4A4A4A]">
                    {t("login.enterVoterId")}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#002147] text-white font-semibold py-3 px-4 rounded shadow-lg hover:bg-[#003A6B] transition disabled:opacity-50 border-2 border-[#FF9933] flex items-center justify-center gap-2"
                >
                  <Vote className="w-5 h-5" />
                  {loading ? t("login.loggingIn") : t("login.login")}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-[#4A4A4A]">
                <p>
                  {t("login.dontHaveVoterId")}{" "}
                  <Link href="/register" className="text-[#002147] hover:text-[#003A6B] font-semibold underline">
                    {t("login.registerNow")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
