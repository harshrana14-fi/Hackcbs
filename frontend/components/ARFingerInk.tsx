"use client";
import { useRef, useEffect, useState } from "react";

interface ARFingerInkProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export default function ARFingerInk({ onComplete, onError }: ARFingerInkProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [inkApplied, setInkApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeCamera = async () => {
      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // Front camera for selfie
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });

        streamRef.current = stream;

        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            if (videoRef.current) {
              const onLoadedMetadata = () => {
                videoRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
                resolve(true);
              };
              videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
              videoRef.current.play();
            }
          });

          if (mounted) {
            await initializeMediaPipe();
          }
        }
      } catch (err: any) {
        const errorMsg = 
          err.name === "NotAllowedError"
            ? "Camera access denied. Please allow camera access."
            : err.name === "NotFoundError"
            ? "No camera found. Please connect a camera."
            : "Failed to access camera. Please try again.";
        
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    };

    const initializeMediaPipe = async () => {
      try {
        setIsDetecting(true);
        
        // Load MediaPipe Hands
        const handsModule = await import('@mediapipe/hands');
        const cameraModule = await import('@mediapipe/camera_utils');
        
        const Hands = handsModule.Hands;
        const Camera = cameraModule.Camera;

        if (!Hands || !Camera) {
          throw new Error("MediaPipe modules not available");
        }

        const hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.3, // Lower threshold for better detection
          minTrackingConfidence: 0.3
        });

        let lastDetectionTime = 0;
        let detectionCount = 0;

        hands.onResults((results: any) => {
          if (!mounted || !canvasRef.current || !videoRef.current) return;

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Set canvas size once and keep it stable
          if (canvas.width !== videoRef.current.videoWidth || 
              canvas.height !== videoRef.current.videoHeight) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
          }

          // Clear canvas for fresh drawing
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // Find the hand with index finger most visible
            let bestHand = null;
            let bestConfidence = 0;

            for (const landmarks of results.multiHandLandmarks) {
              // Check if index finger is visible (landmark 8 - tip, landmark 6 - PIP)
              const indexFingerTip = landmarks[8];
              const indexFingerPIP = landmarks[6];
              const indexFingerMCP = landmarks[5];
              
              if (indexFingerTip && indexFingerPIP && indexFingerMCP) {
                // Calculate finger extension (if tip is above PIP, finger is extended)
                const tipY = indexFingerTip.y;
                const pipY = indexFingerPIP.y;
                const mcpY = indexFingerMCP.y;
                
                // Finger is extended if tip is above PIP
                const isExtended = tipY < pipY && pipY < mcpY;
                
                if (isExtended) {
                  const confidence = 1 - Math.abs(tipY - pipY);
                  if (confidence > bestConfidence) {
                    bestConfidence = confidence;
                    bestHand = landmarks;
                  }
                }
              }
            }

            if (bestHand) {
              const indexFingerTip = bestHand[8];
              const indexFingerPIP = bestHand[6];
              
              // Convert normalized coordinates to pixel coordinates
              const tipX = indexFingerTip.x * canvas.width;
              const tipY = indexFingerTip.y * canvas.height;
              const pipX = indexFingerPIP.x * canvas.width;
              const pipY = indexFingerPIP.y * canvas.height;

              // Draw digital ink on index finger
              drawInkMark(ctx, tipX, tipY, pipX, pipY);
              
              // Track detection for stability
              const now = Date.now();
              if (now - lastDetectionTime < 100) {
                detectionCount++;
              } else {
                detectionCount = 1;
              }
              lastDetectionTime = now;

              // Apply ink after stable detection (3 frames)
              if (detectionCount >= 3 && !inkApplied) {
                setInkApplied(true);
                setIsDetecting(false);
                
                // Keep camera running for photo capture - DON'T stop it
                // Auto-complete after 5 seconds (gives time to capture photo)
                if (detectionTimeoutRef.current) {
                  clearTimeout(detectionTimeoutRef.current);
                }
                detectionTimeoutRef.current = setTimeout(() => {
                  if (onComplete) onComplete();
                }, 5000);
              }
            } else {
              // Reset detection count if finger not extended
              detectionCount = 0;
            }
          } else {
            detectionCount = 0;
          }
        });

        handsRef.current = hands;

        // Start camera processing
        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (mounted && videoRef.current && handsRef.current) {
                try {
                  await handsRef.current.send({ image: videoRef.current });
                } catch (err) {
                  console.error("Error processing frame:", err);
                }
              }
            },
            width: 640,
            height: 480
          });
          
          cameraRef.current = camera;
          camera.start();
        }
      } catch (err: any) {
        console.error("Error initializing MediaPipe:", err);
        setError("Failed to initialize finger detection. Please refresh and try again.");
        if (onError) onError(err.message || "Failed to initialize finger detection");
        setIsDetecting(false);
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
      
      // Clean up
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
      
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.error("Error stopping camera:", e);
        }
      }
      
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch (e) {
          console.error("Error closing hands:", e);
        }
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onComplete, onError]);

  // Helper function to draw rounded rectangle (for browser compatibility)
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawInkMark = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pipX: number,
    pipY: number
  ) => {
    // Draw realistic voting ink - narrow vertical streak on the skin part below nail
    // Based on the image: 2-3mm wide, 1.5-2cm long, vertical streak on finger pad/skin
    
    // Save context state
    ctx.save();
    
    // Calculate finger direction for vertical orientation
    const fingerLength = Math.sqrt(Math.pow(pipX - x, 2) + Math.pow(pipY - y, 2));
    const angle = Math.atan2(pipY - y, pipX - x);
    
    // Ink dimensions: small and clear
    const inkWidth = 8; // ~2-3mm wide (scaled to canvas)
    const inkLength = 50; // ~1.5-2cm long (scaled to canvas)
    
    // Position on the skin part below the nail (finger pad area)
    // The nail is on the dorsal (top) side, skin is on the palmar (bottom) side
    // For a finger pointing up in selfie view, skin is on the side facing away from camera
    
    // Calculate perpendicular direction to finger (for offset to skin side)
    const perpAngle = angle + Math.PI / 2; // 90 degrees from finger direction
    
    // Calculate the position along the finger (starting from cuticle area, going down)
    // Position it on the finger pad area, which is below the nail
    const cuticleDistance = inkLength * 0.25; // Start from cuticle area (back from tip)
    
    // Offset to skin side - for finger pointing up, skin is on the "back" side
    // Use larger offset to ensure it's on the skin surface, not floating
    const skinOffset = 8; // Offset to position on skin surface (finger pad)
    
    // Position: along finger direction + offset to skin side
    // The skin is on the opposite side of the nail, so we offset in the perpendicular direction
    const startX = x - Math.cos(angle) * cuticleDistance + Math.cos(perpAngle) * skinOffset;
    const startY = y - Math.sin(angle) * cuticleDistance + Math.sin(perpAngle) * skinOffset;
    
    // Draw clear, well-defined vertical streak
    ctx.translate(startX, startY);
    ctx.rotate(angle + Math.PI / 2); // Rotate to follow finger direction
    
    // Main ink streak - clear and defined
    const gradient = ctx.createLinearGradient(0, 0, 0, inkLength);
    gradient.addColorStop(0, 'rgba(75, 0, 130, 0.95)'); // Deep purple at top (cuticle)
    gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.98)'); // Darkest in middle
    gradient.addColorStop(1, 'rgba(75, 0, 130, 0.90)'); // Slightly lighter at bottom
    
    // Draw the vertical streak - rounded rectangle shape
    const cornerRadius = 2; // Slightly rounded corners
    
    // Draw rounded rectangle for main ink streak
    drawRoundedRect(ctx, -inkWidth / 2, 0, inkWidth, inkLength, cornerRadius);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add slight darker core for depth (also rounded)
    drawRoundedRect(ctx, -inkWidth / 2 + 1, 0, inkWidth - 2, inkLength, cornerRadius - 0.5);
    ctx.fillStyle = 'rgba(50, 0, 100, 0.95)';
    ctx.fill();
    
    // Add a slightly darker spot at the bottom (where applicator pressed)
    ctx.beginPath();
    ctx.ellipse(0, inkLength - 5, inkWidth / 2, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(50, 0, 100, 1)';
    ctx.fill();
    
    // Rounded border for clarity
    ctx.strokeStyle = 'rgba(75, 0, 130, 0.8)';
    ctx.lineWidth = 0.5;
    drawRoundedRect(ctx, -inkWidth / 2, 0, inkWidth, inkLength, cornerRadius);
    ctx.stroke();

    // Restore context state
    ctx.restore();
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Create a new canvas for the final photo
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = video.videoWidth;
    photoCanvas.height = video.videoHeight;
    const photoCtx = photoCanvas.getContext('2d');
    
    if (!photoCtx) return;

    // Draw video frame (mirrored back to normal)
    photoCtx.save();
    photoCtx.scale(-1, 1);
    photoCtx.drawImage(video, -photoCanvas.width, 0, photoCanvas.width, photoCanvas.height);
    photoCtx.restore();

    // Draw the ink overlay (already mirrored, so mirror it back)
    photoCtx.save();
    photoCtx.scale(-1, 1);
    photoCtx.drawImage(canvas, -photoCanvas.width, 0, photoCanvas.width, photoCanvas.height);
    photoCtx.restore();

    // Convert to blob and download
    photoCanvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `voting-ink-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      alert('Photo captured successfully! Your voting ink photo has been downloaded.');
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Instructions */}
      <div className="absolute top-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg z-10">
        <h3 className="font-bold text-lg mb-2">🗳️ Digital Voting Ink - Your Vote Trademark</h3>
        <p className="text-sm">
          {isDetecting && !inkApplied
            ? "Extend your index finger and point it at the camera. Keep it steady for 2-3 seconds."
            : inkApplied
            ? "✓ Digital voting ink applied! This is your voting trademark."
            : "Position your index finger in front of the camera. Make sure it's well-lit and fully extended."}
        </p>
      </div>

      {/* Video Feed - No blinking */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror for selfie view
        />

        {/* Canvas Overlay - Only for ink, not video */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            pointerEvents: 'none',
            transform: 'scaleX(-1)' // Mirror to match video
          }}
        />

        {/* Finger Guide Overlay */}
        {!inkApplied && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Guide circle for finger position */}
              <div className="w-64 h-64 border-4 border-blue-500/50 rounded-full flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">👆</div>
                  <p className="text-sm font-semibold">Extend Your Index Finger</p>
                  <p className="text-xs mt-1 text-blue-300">Point it straight at the camera</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Overlay - Small, non-blocking */}
        {inkApplied && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none z-10">
            <div className="bg-green-500/90 text-white px-6 py-3 rounded-lg text-center animate-pulse">
              <div className="text-2xl mb-1">✓</div>
              <p className="text-sm font-bold">Ink Applied!</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg z-10">
          <p className="font-semibold mb-2">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-white text-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Reload Page
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isDetecting && !inkApplied && !error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Detecting index finger... Extend your finger fully</span>
          </div>
        </div>
      )}

      {/* Photo Capture Button - Appears when ink is applied */}
      {inkApplied && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={capturePhoto}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-lg">Capture Photo</span>
          </button>
        </div>
      )}
    </div>
  );
}
