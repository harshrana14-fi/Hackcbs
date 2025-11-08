"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoteModal from "@/components/VoteModal";
import VoteButton from "@/components/VoteButton";
import { castVoteOnBlockchain } from "@/app/utils/blockchain";
import { electionAPI } from "@/app/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  voteCount?: number;
}

interface Election {
  id: string;
  title: string;
  description: string;
  endDate: string;
  candidates: Candidate[];
  hasVoted: boolean;
}

interface BlockchainVoteResult {
  success: boolean;
  transactionHash: string;
  voterHash: string;
  timestamp: string;
  error?: string;
}

export default function VotingPage() {
  const { t } = useLanguage();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voting, setVoting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      // Fetch elections from the backend
      const response = await electionAPI.getEligibleElections("user123"); // In a real app, this would be the actual user ID
      
      // Get voter ID from localStorage
      const voterId = typeof window !== 'undefined' ? localStorage.getItem("voterId") : null;
      
      // Fetch candidates for each election and check if user has voted
      const electionsWithCandidates = await Promise.all(
        response.elections.map(async (election: any) => {
          try {
            // Fetch candidates
            const candidatesResponse = await electionAPI.getCandidates(election.id);
            
            // Check if user has voted in this election
            // Use the userHasVoted field from the backend response
            let hasVoted = election.userHasVoted || false;
            
            // Also check localStorage as a fallback
            if (voterId && !hasVoted) {
              const voteStatus = typeof window !== 'undefined' ? localStorage.getItem(`voted_${election.id}`) : null;
              hasVoted = voteStatus === "true";
            }
            
            return {
              ...election,
              candidates: candidatesResponse.candidates || [],
              hasVoted: hasVoted
            };
          } catch (error) {
            console.error(`Error fetching candidates for election ${election.id}:`, error);
            return {
              ...election,
              candidates: [],
              hasVoted: false
            };
          }
        })
      );
      
      setElections(electionsWithCandidates);
    } catch (err: any) {
      setError(err.message || "Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = (election: Election) => {
    setSelectedElection(election);
    setIsModalOpen(true);
  };

  const handleVote = async (candidateId: string) => {
    if (!selectedElection) return;

    try {
      setVoting(true);

      // Get voter ID from localStorage
      const voterId = typeof window !== 'undefined' ? localStorage.getItem("voterId") : null;  
      if (!voterId) {
        throw new Error("Voter ID not found. Please log in again.");
      }

      // Find the candidate by ID
      const candidate = selectedElection.candidates.find(c => c.id === candidateId);
      if (!candidate) {
        throw new Error(`Candidate not found: ${candidateId}`);
      }

      // Get user ID from localStorage or use a default
      const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
      
      // Use string IDs (MongoDB ObjectIds) - DO NOT convert to numbers
      // Log the data being sent for debugging
      console.log("Vote data being sent:", {
        userId: userId || "user123", // In a real app, this would be the actual user ID
        electionId: selectedElection.id,
        candidateId: candidate.id,
        voterId: voterId
      });

      // Cast vote on blockchain - use string IDs directly
      const voteData = {
        userId: userId || "user123",
        electionId: selectedElection.id, // Keep as string ObjectId
        candidateId: candidate.id, // Keep as string ObjectId
        voterId: voterId
      };

      // Cast the vote (function accepts strings but JSDoc says numbers - using type assertion)
      const result = await castVoteOnBlockchain(voteData as any) as BlockchainVoteResult;
      
      console.log("Vote result:", result);
      
      if (result.success) {
        // Mark that the user has voted in this election in localStorage
        // Note: In a real blockchain implementation, we would check the blockchain for this
        if (typeof window !== 'undefined') {
          localStorage.setItem(`voted_${selectedElection.id}`, "true");
        }
        
        // Update local state to show the vote was cast 
        setElections(prev => prev.map(election => 
          election.id === selectedElection.id
            ? {...election, hasVoted: true}
            : election
        ));

        // Store voting status
        localStorage.setItem("hasVoted", "true");
        localStorage.setItem("lastElection", selectedElection.title);
        localStorage.setItem("transactionHash", result.transactionHash);

        // Close modal
        setIsModalOpen(false);


        // Navigate to badge page
        router.push(`/badge?voted=true&election=${encodeURIComponent(selectedElection.title)}&tx=${result.transactionHash}`);

        // Show confirmation with transaction hash      
        alert(`Your vote has been successfully recorded on the blockchain!\nTransaction Hash: ${result.transactionHash}\n\nNote: Your vote is now permanently recorded and cannot be changed.`);

      } else {
        throw new Error(result.error || "Failed to cast vote on blockchain");
      }
    } catch (err: any) {
      console.error("Vote casting error:", err);
      alert(`Failed to cast vote: ${err.message || "Please try again."}\n\nNote: Blockchain voting requires a stable internet connection.`);
    } finally {
      setVoting(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("vote.loadingElections")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">{t("common.error")}</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchElections}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{t("vote.vote")}</h1>
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              {t("vote.backToDashboard")}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("vote.availableElections")}</h2>
            
            {elections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t("vote.noElectionsAvailable")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {elections.map((election) => (
                  <div 
                    key={election.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{election.title}</h3>
                        <p className="text-gray-600 mt-1">{election.description}</p>
                      </div>
                      {election.hasVoted && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {t("vote.voted")}
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">{t("vote.endsOn")}: {election.endDate}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          {(election.candidates || []).length} {t("vote.candidates")}
                        </p>
                      </div>
                      
                      <VoteButton
                        onClick={() => handleVoteClick(election)}
                        disabled={election.hasVoted || voting}
                        hasVoted={election.hasVoted}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <VoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidates={selectedElection?.candidates || []}
        onVote={handleVote}
        electionTitle={selectedElection?.title || ""}
      />
    </div>
  );
}