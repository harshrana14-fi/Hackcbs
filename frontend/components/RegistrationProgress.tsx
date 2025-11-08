interface Props {
  step: number;
}

export default function RegistrationProgress({ step }: Props) {
  const steps = ["Personal Info", "Aadhaar Verification", "Face Verification"];
  
  return (
    <div className="flex justify-center mt-8 space-x-6">
      {steps.map((label, index) => (
        <div key={index} className={`flex flex-col items-center ${index < step ? "text-blue-600" : "text-gray-400"}`}>
          <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${index < step ? "border-blue-600 bg-blue-100" : "border-gray-400"}`}>
            {index + 1}
          </div>
          <p className="text-sm mt-2">{label}</p>
        </div>
      ))}
    </div>
  );
}
