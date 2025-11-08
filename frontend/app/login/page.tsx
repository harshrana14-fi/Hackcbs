"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAPI } from "../api";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-gray-800 text-slate-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{t("login.welcomeBack")}</h1>
              <p className="text-slate-400">{t("login.loginWithVoterId")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("login.voterId")}
                </label>
                <input
                  type="text"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                  placeholder="e.g., VCUP000025NHCVPU5"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  {t("login.enterVoterId")}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg shadow hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
              >
                {loading ? t("login.loggingIn") : t("login.login")}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              <p>
                {t("login.dontHaveVoterId")}{" "}
                <Link href="/register" className="text-indigo-400 hover:text-indigo-300">
                  {t("login.registerNow")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}