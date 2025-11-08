"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminAPI } from "@/app/api";

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    department: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // Register admin via API
      const response = await adminAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organization: formData.organization,
        department: formData.department
      });
      
      setSuccess("Registration successful! Redirecting to dashboard...");
      
      // Store admin session (in a real app, this would be a secure token from the backend)
      localStorage.setItem("isAdmin", "true");
      
      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
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
              <h1 className="text-3xl font-bold text-white mb-2">Admin Registration</h1>
              <p className="text-slate-400">Create an account to manage elections</p>
            </div>

            {success && (
              <div className="text-sm text-green-400 bg-green-900/30 p-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@organization.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Organization *
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="e.g., Election Commission"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                >
                  <option value="">Select department</option>
                  <option value="election-management">Election Management</option>
                  <option value="voter-registration">Voter Registration</option>
                  <option value="technology">Technology</option>
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              <p>
                Already have an account?{" "}
                <Link href="/admin/login" className="text-indigo-400 hover:text-indigo-300">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}