import { useState } from "react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
}

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  onVote: (candidateId: string) => void;
  electionTitle: string;
}

export default function VoteModal({ 
  isOpen, 
  onClose, 
  candidates, 
  onVote,
  electionTitle
}: VoteModalProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showManifesto, setShowManifesto] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVote = () => {
    if (selectedCandidate) {
      onVote(selectedCandidate);
      setSelectedCandidate(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Vote in {electionTitle}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div 
                key={candidate.id}
                className={`border rounded-xl p-4 transition ${
                  selectedCandidate === candidate.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={candidate.id}
                    name="candidate"
                    checked={selectedCandidate === candidate.id}
                    onChange={() => setSelectedCandidate(candidate.id)}
                    className="h-5 w-5 text-indigo-600"
                  />
                  <label 
                    htmlFor={candidate.id}
                    className="ml-3 flex-1 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-800">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.party}</p>
                      </div>
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">{candidate.symbol}</span>
                      </div>
                    </div>
                  </label>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setShowManifesto(showManifesto === candidate.id ? null : candidate.id)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    {showManifesto === candidate.id ? "Hide Manifesto" : "View Manifesto"}
                  </button>
                </div>
                
                {showManifesto === candidate.id && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Manifesto</h4>
                    <p className="text-sm text-gray-600">
                      This is a sample manifesto for {candidate.name} from {candidate.party}. 
                      In a real application, this would contain detailed policy positions and plans.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleVote}
              disabled={!selectedCandidate}
              className={`px-5 py-2 rounded-lg font-medium ${
                selectedCandidate
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Cast Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}