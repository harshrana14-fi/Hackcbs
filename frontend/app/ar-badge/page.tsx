"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ARFingerInk from "@/components/ARFingerInk";
import QRScannerAR from "@/components/QRScannerAR";
import { motion } from "framer-motion";

function ARBadgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showScanner, setShowScanner] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has voted (from query params or localStorage)
    const voted = searchParams.get("voted") === "true" || localStorage.getItem("hasVoted") === "true";
    const direct = searchParams.get("direct") === "true";
    setHasVoted(voted);

    // If direct mode (after voting), open AR camera directly
    if (voted && direct) {
      setShowAR(true);
    } else if (voted) {
      // Otherwise show scanner for QR code
      setShowScanner(true);
    }
  }, [searchParams]);

  const handleQRScan = async (data: string) => {
    try {
      // Verify QR code contains voting badge data
      if (data.includes("voting-badge-ar://")) {
        // Verify QR code with backend
        const response = await fetch("http://localhost:5001/api/qr/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qrData: data }),
        });

        const result = await response.json();
        
        if (result.success && result.valid) {
          setQrCodeData(data);
          setShowScanner(false);
          setShowAR(true);
        } else {
          alert("Invalid QR code. Please scan the voting badge QR code.");
        }
      } else {
        alert("Invalid QR code format. Please scan the voting badge QR code.");
      }
    } catch (error) {
      console.error("Error verifying QR code:", error);
      // Still allow AR experience if QR format is correct
      if (data.includes("voting-badge-ar://")) {
        setQrCodeData(data);
        setShowScanner(false);
        setShowAR(true);
      } else {
        alert("Failed to verify QR code. Please try again.");
      }
    }
  };

  const handleInkComplete = () => {
    // Ink applied - user can now capture photo if they want
    // No alert/confirmation dialog
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "I Voted! 🗳️",
          text: "I just cast my vote and got my digital voting ink! Check out my voting badge! 🎉",
          url: window.location.href,
        });
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard! Share it on social media.");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (showScanner) {
    return (
      <QRScannerAR
        onScan={handleQRScan}
        onClose={() => {
          setShowScanner(false);
          router.push("/dashboard");
        }}
      />
    );
  }

  if (showAR) {
    return (
      <ARFingerInk
        onComplete={handleInkComplete}
        onError={(error) => {
          alert(`Error: ${error}`);
        }}
      />
    );
  }

  // Initial landing page
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AR Voting Badge</h1>
          <p className="text-gray-600">
            {hasVoted 
              ? "Scan the QR code to unlock your digital voting ink experience!"
              : "After voting, scan the QR code to get your digital voting ink badge."}
          </p>
        </div>

        {hasVoted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScanner(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition mb-4"
          >
            Scan QR Code
          </motion.button>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              Please vote first to unlock your AR voting badge experience.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-500 hover:text-gray-700 text-sm transition"
        >
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
}

export default function ARBadgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <ARBadgeContent />
    </Suspense>
  );
}
