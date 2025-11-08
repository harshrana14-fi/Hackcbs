import { decodeVoterId } from "@/app/utils/voterIdDecoder";

interface VoterProfileCardProps {

  voterId: string;
  aadhaarVerified: boolean;
  faceVerified: boolean;
}

export default function VoterProfileCard({ 

  voterId, 
  aadhaarVerified, 
  faceVerified 
}: VoterProfileCardProps) {
  // Decode voter ID to get location information
  const decodedInfo: any = decodeVoterId(voterId);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Voter Profile</h2>
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-indigo-600 font-bold text-lg">
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Voter ID</p>
          <p className="font-mono text-gray-800">{voterId}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">State</p>
            <p className="font-medium text-gray-800">
              {decodedInfo.valid && decodedInfo.state ? decodedInfo.state : "Unknown"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">District</p>
            <p className="font-medium text-gray-800">
              {decodedInfo.valid && decodedInfo.district ? decodedInfo.district : "Unknown"}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Constituency</p>
          <p className="font-medium text-gray-800">
            {decodedInfo.valid && decodedInfo.constituency ? decodedInfo.constituency : "Unknown"}
          </p>
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-medium text-gray-800 mb-3">Verification Status</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${aadhaarVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-gray-600">Aadhaar Verification</span>
              {aadhaarVerified && (
                <span className="ml-auto text-green-600 text-sm font-medium">Verified</span>
              )}
            </div>
            
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${faceVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-gray-600">Face Verification</span>
              {faceVerified && (
                <span className="ml-auto text-green-600 text-sm font-medium">Verified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}