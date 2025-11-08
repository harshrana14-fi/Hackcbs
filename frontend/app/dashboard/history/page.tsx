"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface VotingHistoryItem {
  id: string;
  electionId: string;
  electionTitle: string;
  electionType: string;
  candidateId: string;
  candidateName: string;
  timestamp: string;
  blockchainHash: string;
}

export default function VotingHistoryPage() {
  const [voterId, setVoterId] = useState<string | null>(null);
  const [votingHistory, setVotingHistory] = useState<VotingHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedVoterId = localStorage.getItem("voterId");
    if (!storedVoterId) {
      // Redirect to login if not logged in
      router.push("/login");
    } else {
      setVoterId(storedVoterId);
      fetchVotingHistory(storedVoterId);
    }
  }, [router]);

  const fetchVotingHistory = async (voterId: string) => {
    try {
      setLoading(true);
      
      // Get API base URL from environment or use default
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      
      // Fetch voting history from the backend API
      const response = await fetch(`${API_BASE_URL}/voters/${voterId}/history`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch voting history");
      }
      
      const data = await response.json();
      
      setVotingHistory(data.votingHistory);
    } catch (err: any) {
      setError(err.message || "Failed to fetch voting history");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getElectionTypeLabel = (type: string) => {
    switch (type) {
      case "lok-sabha": return "Lok Sabha";
      case "state-assembly": return "State Assembly";
      case "local": return "Local/Municipal";
      default: return type;
    }
  };

  if (!voterId) {
    return null; // Don't render anything while checking auth status
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Voting History</h1>
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading voting history...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-xl font-bold mb-2">Error</div>
                <p className="text-gray-600">{error}</p>
                <button 
                  onClick={() => fetchVotingHistory(voterId!)}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Retry
                </button>
              </div>
            ) : votingHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📜</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Voting History</h3>
                <p className="text-gray-600 mb-6">You haven't voted in any elections yet.</p>
                <Link 
                  href="/dashboard/vote"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  View Available Elections
                </Link>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  You've voted in {votingHistory.length} election{votingHistory.length !== 1 ? 's' : ''}
                </h2>
                
                <div className="space-y-6">
                  {votingHistory.map((vote) => (
                    <div key={vote.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{vote.electionTitle}</h3>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                              {getElectionTypeLabel(vote.electionType)}
                            </span>
                            <span>Voted on: {formatDate(vote.timestamp)}</span>
                          </div>
                          <div className="mt-3 text-gray-700">
                            <span className="font-medium">Candidate:</span> {vote.candidateName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Transaction Hash</div>
                          <div className="font-mono text-xs text-gray-700 mt-1">
                            {vote.blockchainHash.substring(0, 10)}...{vote.blockchainHash.substring(vote.blockchainHash.length - 8)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Election ID: {vote.electionId}
                          </div>
                          <Link 
                            href={`/dashboard/results?electionId=${vote.electionId}`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            View Results →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}