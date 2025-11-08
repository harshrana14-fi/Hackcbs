"use client";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VotingBadgeProps {
  voterId?: string;
  electionTitle?: string;
  transactionHash?: string;
  onClose?: () => void;
}

export default function VotingBadge({ 
  voterId, 
  electionTitle, 
  transactionHash,
  onClose 
}: VotingBadgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [badgeImage, setBadgeImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    generateBadge();
  }, [voterId, electionTitle, transactionHash]);

  const generateBadge = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size - higher resolution
    canvas.width = 1200;
    canvas.height = 1200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create stunning gradient background
    const bgGradient = ctx.createRadialGradient(
      canvas.width / 2, 
      canvas.height / 2, 
      0,
      canvas.width / 2, 
      canvas.height / 2, 
      canvas.width
    );
    bgGradient.addColorStop(0, '#0f172a'); // Deep slate
    bgGradient.addColorStop(0.3, '#1e293b'); // Slate
    bgGradient.addColorStop(0.6, '#1e3a8a'); // Deep blue
    bgGradient.addColorStop(1, '#3b82f6'); // Blue
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Outer glow effect
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 300, centerX, centerY, 500);
    glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 500, 0, Math.PI * 2);
    ctx.fill();

    // Decorative outer ring with gradient
    const ringGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    ringGradient.addColorStop(0, '#fbbf24'); // Gold
    ringGradient.addColorStop(0.5, '#f59e0b'); // Amber
    ringGradient.addColorStop(1, '#d97706'); // Orange
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 480, 0, Math.PI * 2);
    ctx.stroke();

    // Inner decorative rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 460 - (i * 15), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Main badge shape - shield/medal design
    const badgeRadius = 380;
    
    // Badge background with multiple gradients
    const badgeGradient = ctx.createRadialGradient(
      centerX, centerY - 50, 0,
      centerX, centerY, badgeRadius
    );
    badgeGradient.addColorStop(0, '#ffffff');
    badgeGradient.addColorStop(0.3, '#f8fafc');
    badgeGradient.addColorStop(0.6, '#e2e8f0');
    badgeGradient.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = badgeGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, badgeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Badge border with gradient
    const borderGradient = ctx.createLinearGradient(
      centerX - badgeRadius, centerY - badgeRadius,
      centerX + badgeRadius, centerY + badgeRadius
    );
    borderGradient.addColorStop(0, '#1e3a8a');
    borderGradient.addColorStop(0.5, '#3b82f6');
    borderGradient.addColorStop(1, '#6366f1');
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, badgeRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Decorative laurel wreath elements
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#10b981';
    
    // Left side laurel
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI + (i * 0.3) - 0.6;
      const x = centerX + Math.cos(angle) * (badgeRadius - 30);
      const y = centerY + Math.sin(angle) * (badgeRadius - 30);
      drawLeaf(ctx, x, y, angle, 20);
    }
    
    // Right side laurel
    for (let i = 0; i < 5; i++) {
      const angle = (i * 0.3) - 0.6;
      const x = centerX + Math.cos(angle) * (badgeRadius - 30);
      const y = centerY + Math.sin(angle) * (badgeRadius - 30);
      drawLeaf(ctx, x, y, angle, 20);
    }

    // Decorative stars around badge
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (badgeRadius + 50);
      const y = centerY + Math.sin(angle) * (badgeRadius + 50);
      drawStar(ctx, x, y, 18, 10, 5);
    }

    // Main "I VOTED" text with shadow and gradient
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    const textGradient = ctx.createLinearGradient(
      centerX - 200, centerY - 150,
      centerX + 200, centerY + 150
    );
    textGradient.addColorStop(0, '#1e3a8a');
    textGradient.addColorStop(0.5, '#3b82f6');
    textGradient.addColorStop(1, '#1e3a8a');
    
    ctx.fillStyle = textGradient;
    ctx.font = 'bold 110px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('I VOTED', centerX, centerY - 120);

    // "USING VOTECHAIN" text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 50px Arial';
    ctx.fillText('USING', centerX, centerY - 30);
    
    // VoteChain branding with emerald accent
    const votechainGradient = ctx.createLinearGradient(
      centerX - 180, centerY + 30,
      centerX + 180, centerY + 30
    );
    votechainGradient.addColorStop(0, '#1e3a8a');
    votechainGradient.addColorStop(0.5, '#10b981'); // Emerald
    votechainGradient.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = votechainGradient;
    ctx.font = 'bold 70px Arial';
    ctx.fillText('VOTECHAIN', centerX, centerY + 50);

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Verified checkmark circle with gradient
    const checkX = centerX;
    const checkY = centerY + 150;
    
    // Checkmark circle background
    const circleGradient = ctx.createRadialGradient(checkX, checkY, 0, checkX, checkY, 70);
    circleGradient.addColorStop(0, '#10b981');
    circleGradient.addColorStop(1, '#059669');
    ctx.fillStyle = circleGradient;
    ctx.beginPath();
    ctx.arc(checkX, checkY, 70, 0, Math.PI * 2);
    ctx.fill();
    
    // White checkmark
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(checkX - 30, checkY);
    ctx.lineTo(checkX - 8, checkY + 22);
    ctx.lineTo(checkX + 30, checkY - 20);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // "VERIFIED" text below checkmark
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('VERIFIED', centerX, checkY + 120);

    // Election information section
    const infoY = centerY + 280;
    
    if (electionTitle) {
      // Election title background
      ctx.fillStyle = 'rgba(30, 58, 138, 0.15)';
      ctx.beginPath();
      ctx.roundRect(centerX - 350, infoY, 700, 60, 30);
      ctx.fill();
      
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 38px Arial';
      ctx.fillText(electionTitle, centerX, infoY + 40);
    }

    // Date badge
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    ctx.fillStyle = 'rgba(30, 58, 138, 0.95)';
    ctx.beginPath();
    ctx.roundRect(centerX - 200, infoY + 80, 400, 55, 25);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(date, centerX, infoY + 120);

    // Transaction hash (blockchain proof)
    if (transactionHash) {
      const shortHash = transactionHash.substring(0, 14) + '...';
      
      // Hash badge with blockchain theme
      ctx.fillStyle = 'rgba(16, 185, 129, 0.95)'; // Emerald tint
      ctx.beginPath();
      ctx.roundRect(centerX - 220, infoY + 150, 440, 55, 25);
      ctx.fill();
      
      // Small chain icon before hash
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      ctx.fillText('🔗', centerX - 190, infoY + 188);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`TX: ${shortHash}`, centerX, infoY + 188);
    }

    // Bottom tagline
    ctx.fillStyle = '#fbbf24'; // Gold accent
    ctx.font = 'bold 42px Arial';
    ctx.fillText('Digital Democracy • Secure • Transparent', centerX, infoY + 240);

    // Blockchain chain links decoration (top)
    const chainY = centerY - 300;
    ctx.strokeStyle = '#10b981'; // Emerald green
    ctx.fillStyle = '#10b981';
    ctx.lineWidth = 5;
    for (let i = 0; i < 5; i++) {
      const chainX = centerX - 200 + (i * 100);
      drawChainLink(ctx, chainX, chainY, 50);
    }

    // Subtle circuit lines decoration (sides)
    ctx.strokeStyle = 'rgba(30, 58, 138, 0.25)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Left side circuit
    for (let i = 0; i < 3; i++) {
      const y = centerY - 200 + (i * 150);
      ctx.beginPath();
      ctx.moveTo(centerX - 350, y);
      ctx.lineTo(centerX - 300, y);
      ctx.lineTo(centerX - 300, y + 25);
      ctx.lineTo(centerX - 250, y + 25);
      ctx.stroke();
    }
    
    // Right side circuit
    for (let i = 0; i < 3; i++) {
      const y = centerY - 200 + (i * 150);
      ctx.beginPath();
      ctx.moveTo(centerX + 350, y);
      ctx.lineTo(centerX + 300, y);
      ctx.lineTo(centerX + 300, y + 25);
      ctx.lineTo(centerX + 250, y + 25);
      ctx.stroke();
    }

    // Small decorative blockchain nodes
    ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * 450;
      const y = centerY + Math.sin(angle) * 450;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Connect with lines (blockchain network)
      if (i > 0) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos((i - 1) / 8 * Math.PI * 2) * 450, 
                   centerY + Math.sin((i - 1) / 8 * Math.PI * 2) * 450);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    // Convert to image
    const imageData = canvas.toDataURL('image/png');
    setBadgeImage(imageData);
  };

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    outerRadius: number,
    innerRadius: number,
    points: number
  ) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawLeaf = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    size: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawChainLink = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) => {
    // Draw a chain link
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x + size, y, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Connect the links
    ctx.beginPath();
    ctx.moveTo(x, y - size / 2);
    ctx.lineTo(x + size, y - size / 2);
    ctx.moveTo(x, y + size / 2);
    ctx.lineTo(x + size, y + size / 2);
    ctx.stroke();
  };

  // Add roundRect polyfill for older browsers
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) {
      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + width - radius, y);
      this.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.lineTo(x + width, y + height - radius);
      this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      this.lineTo(x + radius, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();
    };
  }

  const downloadBadge = () => {
    if (!badgeImage) return;

    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = badgeImage;
    link.download = `votechain-voting-badge-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
  };

  const shareBadge = async () => {
    if (!badgeImage) return;

    try {
      const response = await fetch(badgeImage);
      const blob = await response.blob();
      const file = new File([blob], 'votechain-voting-badge.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'I Voted Using VoteChain! 🗳️',
          text: 'I just cast my vote using VoteChain - the future of digital democracy!',
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'I Voted Using VoteChain! 🗳️',
          text: 'I just cast my vote using VoteChain - the future of digital democracy!',
          url: badgeImage,
        });
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('Badge copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      downloadBadge();
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-50 rounded-3xl shadow-xl w-full p-6 sm:p-8 lg:p-10 border border-gray-200"
        >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Your VoteChain Badge</h2>
            <p className="text-gray-600 text-sm sm:text-base">Official verification of your participation in digital democracy</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-2 hover:bg-gray-100 rounded-lg self-end sm:self-auto"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Badge Display with Glow Effect */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative w-full max-w-lg">
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            {badgeImage && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <img
                  src={badgeImage}
                  alt="VoteChain Voting Badge"
                  className="w-full h-auto rounded-2xl shadow-xl border-2 border-gray-200"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadBadge}
            disabled={isDownloading || !badgeImage}
            className="flex-1 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-base sm:text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isDownloading ? 'Downloading...' : 'Download Badge'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareBadge}
            disabled={!badgeImage}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-base sm:text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Badge
          </motion.button>
        </div>

        {/* Social Media Share Buttons */}
        {badgeImage && (
          <div className="pt-6 border-t border-gray-200">
            <p className="text-gray-700 text-sm sm:text-base mb-4 text-center font-medium">
              Share your VoteChain badge on social media:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href={`https://twitter.com/intent/tweet?text=I just voted using VoteChain - the future of digital democracy! 🗳️&url=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
                Twitter
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href={`https://www.instagram.com/`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </motion.a>
            </div>
          </div>
        )}
        </motion.div>
      </div>
    </div>
  );
}
