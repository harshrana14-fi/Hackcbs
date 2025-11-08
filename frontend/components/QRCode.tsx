interface QRCodeProps {
  value: string;
  size?: number;
}

export default function QRCode({ value, size = 128 }: QRCodeProps) {
  // In a real implementation, this would generate an actual QR code
  // For now, we'll create a simple placeholder
  
  return (
    <div 
      className="bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="text-center">
        <div className="text-gray-500 text-xs">QR Code</div>
        <div className="text-gray-400 text-xs mt-1">
          {value.substring(0, 8)}...
        </div>
      </div>
    </div>
  );
}