"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationProgress from "@/components/RegistrationProgress";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerAPI } from "../../api";
import { validateAadhaar } from "../../utils/verhoeff";

export default function AadhaarVerification() {
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarPreviewUrl, setAadhaarPreviewUrl] = useState<string | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [addressProofPreviewUrl, setAddressProofPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'aadhaar' | 'address') => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      if (fileType === 'aadhaar') {
        setAadhaarFile(null);
        setAadhaarPreviewUrl(null);
      } else {
        setAddressProofFile(null);
        setAddressProofPreviewUrl(null);
      }
      return;
    }

    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Unsupported file type. Upload JPG/PNG or PDF.");
      if (fileType === 'aadhaar') {
        setAadhaarFile(null);
        setAadhaarPreviewUrl(null);
      } else {
        setAddressProofFile(null);
        setAddressProofPreviewUrl(null);
      }
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      setError("File is too large. Max size is 5MB.");
      if (fileType === 'aadhaar') {
        setAadhaarFile(null);
        setAadhaarPreviewUrl(null);
      } else {
        setAddressProofFile(null);
        setAddressProofPreviewUrl(null);
      }
      return;
    }

    if (fileType === 'aadhaar') {
      setAadhaarFile(f);
      
      if (f.type === "application/pdf") {
        setAadhaarPreviewUrl("/icons/pdf-file.svg"); // fallback icon; replace with real asset if available
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setAadhaarPreviewUrl(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setAddressProofFile(f);
      
      if (f.type === "application/pdf") {
        setAddressProofPreviewUrl("/icons/pdf-file.svg"); // fallback icon; replace with real asset if available
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setAddressProofPreviewUrl(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, g1, g2, g3) =>
      [g1, g2, g3].filter(Boolean).join(" ")
    );
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setAadhaar(formatAadhaar(e.target.value));
  };

  const validate = () => {
    const digits = aadhaar.replace(/\s/g, "");
    
    // Check if Aadhaar number is exactly 12 digits
    if (digits.length !== 12) {
      setError("Aadhaar number must be 12 digits.");
      return false;
    }
    
    // Validate using Verhoeff algorithm
    if (!validateAadhaar(digits)) {
      setError("Invalid Aadhaar number. Please check the number and try again.");
      return false;
    }
    
    if (!aadhaarFile) {
      setError("Please upload a clear image or PDF of your Aadhaar.");
      return false;
    }
    
    if (!addressProofFile) {
      setError("Please upload a clear image or PDF of your Address Proof.");
      return false;
    }
    
    return true;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem("registrationUserId");
      if (!userId) {
        throw new Error("User ID not found. Please start registration again.");
      }

      // Save Aadhaar details along with address proof type
      // Using "aadhaar" as the address proof type since we're uploading an Aadhaar document
      const response = await registerAPI.saveAadhaarDetails({
        userId,
        aadhaarNumber: aadhaar.replace(/\s/g, ""), // Remove spaces
        addressProofType: "aadhaar", // Changed from "document" to "aadhaar"
      });

      // Navigate to next step
      router.push("/register/face");
    } catch (err: any) {
      console.error("Document verification error:", err);
      setError(err.message || "Failed to verify documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-gray-800 text-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <RegistrationProgress step={2} />
          <section className="bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl overflow-hidden mt-6">
            <header className="px-8 py-6 border-b border-slate-800">
              <h2 className="text-2xl font-semibold">Document Verification</h2>
              <p className="text-sm text-slate-400 mt-1">
                Upload clear copies of your Aadhaar and Address Proof documents.
              </p>
            </header>

            <form onSubmit={handleVerify} className="px-8 py-8 space-y-8">
              {error && (
                <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Aadhaar Section */}
              <div className="border border-slate-700 rounded-xl p-6 bg-slate-800/50">
                <h3 className="text-xl font-semibold text-white mb-4">Aadhaar Verification</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <label className="text-sm text-slate-300 font-medium mb-2 block">Aadhaar Number *</label>
                    <input
                      name="aadhaar"
                      inputMode="numeric"
                      value={aadhaar}
                      onChange={handleAadhaarChange}
                      placeholder="1234 5678 9012"
                      aria-label="Aadhaar number"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">Format will be applied automatically. Do not share your Aadhaar publicly.</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 font-medium mb-2 block">Upload Aadhaar (JPG/PNG/PDF) *</label>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="aadhaar-file"
                        className="inline-flex items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/80 transition text-slate-100"
                      >
                        Choose file
                      </label>
                      <input
                        id="aadhaar-file"
                        type="file"
                        accept=".png,.jpg,.jpeg,application/pdf"
                        onChange={(e) => handleFileChange(e, 'aadhaar')}
                        className="hidden"
                      />
                      <div className="text-sm text-slate-300">
                        {aadhaarFile ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{aadhaarFile.name}</span>
                            <span className="text-xs text-slate-500">({(aadhaarFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">No file chosen</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      {aadhaarPreviewUrl && (
                        <div className="w-full rounded-md border border-slate-700 overflow-hidden">
                          {aadhaarFile?.type === "application/pdf" ? (
                            <div className="flex items-center justify-center p-6 bg-slate-900">
                              <svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                              </svg>
                              <div className="ml-3 text-left">
                                <div className="text-sm font-medium">{aadhaarFile?.name}</div>
                                <div className="text-xs text-slate-400">PDF preview not available</div>
                              </div>
                            </div>
                          ) : (
                            <img src={aadhaarPreviewUrl} alt="Aadhaar preview" className="w-full h-56 object-contain bg-slate-900" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Proof Section */}
              <div className="border border-slate-700 rounded-xl p-6 bg-slate-800/50">
                <h3 className="text-xl font-semibold text-white mb-4">Address Proof</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm text-slate-300 font-medium mb-2 block">Upload Address Proof (JPG/PNG/PDF) *</label>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="address-proof-file"
                        className="inline-flex items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/80 transition text-slate-100"
                      >
                        Choose file
                      </label>
                      <input
                        id="address-proof-file"
                        type="file"
                        accept=".png,.jpg,.jpeg,application/pdf"
                        onChange={(e) => handleFileChange(e, 'address')}
                        className="hidden"
                      />
                      <div className="text-sm text-slate-300">
                        {addressProofFile ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{addressProofFile.name}</span>
                            <span className="text-xs text-slate-500">({(addressProofFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">No file chosen</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      {addressProofPreviewUrl && (
                        <div className="w-full rounded-md border border-slate-700 overflow-hidden">
                          {addressProofFile?.type === "application/pdf" ? (
                            <div className="flex items-center justify-center p-6 bg-slate-900">
                              <svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                              </svg>
                              <div className="ml-3 text-left">
                                <div className="text-sm font-medium">{addressProofFile?.name}</div>
                                <div className="text-xs text-slate-400">PDF preview not available</div>
                              </div>
                            </div>
                          ) : (
                            <img src={addressProofPreviewUrl} alt="Address proof preview" className="w-full h-56 object-contain bg-slate-900" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-3 bg-transparent border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition"
                  disabled={loading}
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Continue →"}
                </button>
              </div>
            </form>
          </section>

          <p className="text-xs text-slate-500 mt-3 text-center">
            Your uploaded documents are stored securely and used only for verification.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}