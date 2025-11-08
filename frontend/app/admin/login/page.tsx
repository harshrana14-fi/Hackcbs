"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, we would validate the admin credentials
      // For now, we'll just check if the credentials match our test admin
      if (email === "admin@votechain.com" && password === "admin123") {
        // Store admin session (in a real app, this would be a secure token)
        localStorage.setItem("isAdmin", "true");
        
        // Redirect to admin dashboard
        router.push("/admin/dashboard");
      } else {
        throw new Error("Invalid email or password");
      }
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
              <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
              <p className="text-slate-400">Access the election management dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@votechain.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg shadow hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              <p>
                Don't have an account?{" "}
                <Link href="/admin/register" className="text-indigo-400 hover:text-indigo-300">
                  Register
                </Link>
              </p>
              <p className="mt-2">
                Not an admin?{" "}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                  Voter Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}