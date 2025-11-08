"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { registerAPI } from "../../api";

export default function FaceVerification() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voterId, setVoterId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const loadScript = (src: string) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve(true);
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

  useEffect(() => {
    const init = async () => {
      // Don't run if component is not mounted or if we're on the server
      if (typeof window === "undefined" || !isMounted) return;

      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
      );
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
      );

      const FaceMesh = (window as any).FaceMesh;
      const Camera = (window as any).Camera;

      if (!FaceMesh || !Camera) {
        console.error("FaceMesh or Camera still not found on window!");
        setError("Failed to load required libraries. Please refresh the page.");
        return;
      }

      // Add null check for videoRef
      if (!videoRef.current) {
        console.error("Video element not found!");
        setError("Failed to initialize camera. Please refresh the page.");
        return;
      }

      const videoElement = videoRef.current;
      
      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Failed to access camera. Please ensure you've granted camera permissions and try again.");
        return;
      }

      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && capturedImages.length < 3) {
          const canvas = document.createElement("canvas");
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0);
            const img = canvas.toDataURL("image/jpeg");
            setCapturedImages((prev) => [...prev, img]);
          }
        }
      });

      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await faceMesh.send({ image: videoElement });
        },
        width: 640,
        height: 480,
      });

      camera.start();
    };

    init();
    
    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [capturedImages.length, isMounted]);

  useEffect(() => {
    // Start countdown when voterId is set
    if (voterId) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            router.push("/dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup interval on unmount
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [voterId, router]);

  const handleVerificationComplete = async () => {
    if (capturedImages.length < 3) return;

    setLoading(true);
    setError(null);

    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem("registrationUserId");
      if (!userId) {
        throw new Error("User ID not found. Please start registration again.");
      }

      // Send captured images to backend
      const response = await registerAPI.saveFaceDetails({
        userId,
        faceImages: capturedImages,
      });

      // Set voter ID from response
      if (response.user && response.user.voterId) {
        setVoterId(response.user.voterId);
      }
    } catch (err: any) {
      console.error("Face verification error:", err);
      setError(err.message || "Failed to complete face verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Face Verification</h1>

      {voterId ? (
        <div className="text-center mb-6 p-8 bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-2xl border-2 border-green-500 max-w-2xl w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 text-gray-900 font-bold py-1 px-4 rounded-full text-sm">
              SUCCESS
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-green-400 mb-6">Registration Successful!</h2>
          
          <div className="mb-8">
            <p className="text-xl mb-4">Your Voter ID has been generated:</p>
            <div className="text-4xl font-mono font-bold bg-gray-800 p-6 rounded-xl border-2 border-green-400 inline-block mx-auto">
              {voterId}
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-xl mb-6">
            <p className="text-lg mb-2">📋 Please save your Voter ID now!</p>
            <p className="text-gray-300 mb-4">This is your unique identifier for voting purposes.</p>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <span className="font-bold">Redirecting in:</span>
              <span className="text-2xl font-bold">{countdown}</span>
              <span>seconds</span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText(voterId);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all mr-4"
          >
            Copy Voter ID
          </button>
          
          <button 
            onClick={() => router.push("/dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-all"
          >
            Continue to Dashboard
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            width={640}
            height={480}
            className="rounded-xl shadow-2xl border border-gray-700"
          />

          <div className="mt-6 text-center">
            {error && (
              <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {capturedImages.length < 3 ? (
              <p className="text-gray-300">
                Capturing your face... {capturedImages.length}/3
              </p>
            ) : (
              <button
                onClick={handleVerificationComplete}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verification Complete ✅"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}