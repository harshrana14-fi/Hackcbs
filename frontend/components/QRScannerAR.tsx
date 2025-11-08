"use client";
import { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";

interface QRScannerARProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScannerAR({ onScan, onClose }: QRScannerARProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startScanning = async () => {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment", // Use back camera for QR scanning
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // Start QR code scanning
        const scanQR = () => {
          if (!videoRef.current || !canvasRef.current || !scanning) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");

          if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
            animationFrameId = requestAnimationFrame(scanQR);
            return;
          }

          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Get image data
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

          // Scan for QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            setScanning(false);
            onScan(code.data);
            // Stop scanning after successful scan
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            return;
          }

          animationFrameId = requestAnimationFrame(scanQR);
        };

        if (videoRef.current) {
          videoRef.current.addEventListener("loadedmetadata", () => {
            scanQR();
          });
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        setError(
          err.name === "NotAllowedError"
            ? "Camera access denied. Please allow camera access to scan QR codes."
            : err.name === "NotFoundError"
            ? "No camera found. Please connect a camera to scan QR codes."
            : "Failed to access camera. Please try again."
        );
      }
    };

    startScanning();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, scanning]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg transition"
        aria-label="Close scanner"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Instructions */}
      <div className="absolute top-4 left-4 right-20 bg-black/70 text-white p-4 rounded-lg z-10">
        <h3 className="font-bold text-lg mb-2">Scan Voting Badge QR Code</h3>
        <p className="text-sm">
          Point your camera at the voting badge QR code to unlock your AR ink experience.
        </p>
      </div>

      {/* Video Feed */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500"></div>
            
            {/* Scanning line animation */}
            {scanning && (
              <div className="absolute inset-0 border-2 border-blue-500/50">
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for QR processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg z-10">
          <p className="font-semibold mb-2">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={onClose}
            className="mt-3 bg-white text-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {!error && scanning && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Scanning for QR code...</span>
          </div>
        </div>
      )}
    </div>
  );
}

