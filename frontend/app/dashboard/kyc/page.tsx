"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface KycStatus {
  aadhaarVerified: boolean;
  faceVerified: boolean;
  voterIdGenerated: boolean;
  remarks?: string;
}

export default function KycStatusPage() {
  const [kycStatus, setKycStatus] = useState<KycStatus>({
    aadhaarVerified: false,
    faceVerified: false,
    voterIdGenerated: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // For now, using sample data
      const sampleStatus: KycStatus = {
        aadhaarVerified: true,
        faceVerified: true,
        voterIdGenerated: true,
        remarks: "All verification steps completed successfully"
      };
      
      setKycStatus(sampleStatus);
    } catch (err: any) {
      setError(err.message || "Failed to fetch KYC status");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleReverify = () => {
    // In a real implementation, this would redirect to the re-verification flow
    alert("Redirecting to re-verification process...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading KYC status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchKycStatus}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">KYC Status</h1>
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Verification Progress</h2>
            
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 transform translate-x-1/2"></div>
              
              {/* Steps */}
              <div className="space-y-12">
                {/* Aadhaar Verification */}
                <div className="relative flex items-start">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    kycStatus.aadhaarVerified 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-300 text-gray-500"
                  }`}>
                    {kycStatus.aadhaarVerified ? "✓" : "1"}
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">Aadhaar Verification</h3>
                    <p className="text-gray-600 mt-1">
                      {kycStatus.aadhaarVerified 
                        ? "Aadhaar verified successfully" 
                        : "Pending verification"}
                    </p>
                  </div>
                </div>
                
                {/* Face Verification */}
                <div className="relative flex items-start">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    kycStatus.faceVerified 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-300 text-gray-500"
                  }`}>
                    {kycStatus.faceVerified ? "✓" : "2"}
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">Face Verification</h3>
                    <p className="text-gray-600 mt-1">
                      {kycStatus.faceVerified 
                        ? "Face verified successfully" 
                        : "Pending verification"}
                    </p>
                  </div>
                </div>
                
                {/* Voter ID Generation */}
                <div className="relative flex items-start">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    kycStatus.voterIdGenerated 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-300 text-gray-500"
                  }`}>
                    {kycStatus.voterIdGenerated ? "✓" : "3"}
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">Voter ID Generation</h3>
                    <p className="text-gray-600 mt-1">
                      {kycStatus.voterIdGenerated 
                        ? "Voter ID generated successfully" 
                        : "Pending generation"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {kycStatus.remarks && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800">Remarks</h3>
                <p className="text-blue-600 mt-1">{kycStatus.remarks}</p>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleReverify}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition"
              >
                Re-verify Documents
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}