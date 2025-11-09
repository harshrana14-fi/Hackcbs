import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 pt-32 pb-12">
        <div className="text-center max-w-2xl">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-[#002147] flex items-center justify-center shadow-lg mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-[#FF9933]" />
          </div>
          <h1 className="text-5xl font-bold text-[#002147] mb-4 govt-heading">
            404
          </h1>
          <h2 className="text-3xl font-bold text-[#002147] mb-4 govt-heading">
            Page Not Found
          </h2>
          <p className="text-lg text-[#4A4A4A] mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#002147] text-white font-semibold px-8 py-3 rounded shadow-lg hover:bg-[#003A6B] transition border-2 border-[#FF9933]"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#002147] text-[#002147] font-semibold px-8 py-3 rounded hover:bg-[#F5F5F5] transition"
            >
              Go to Dashboard
            </Link>
          </div>
          <div className="mt-8 text-sm text-[#4A4A4A]">
            <p>भारत निर्वाचन आयोग | Election Commission of India</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
