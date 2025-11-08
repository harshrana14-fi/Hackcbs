"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchResultsFromBlockchain } from "@/app/utils/blockchain";
import { electionAPI } from "@/app/api";

interface CandidateResult {
  id: string;
  name: string;
  voteCount: number;
  party: string;
  percentage: number;
}

interface ElectionResult {
  id: string;
  title: string;
  description: string;
  electionType: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  lastUpdated: string;
  totalVotes: number;
  candidates: CandidateResult[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("current");
  const [polling, setPolling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchResults();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      if (!loading && !polling) {
        fetchResults();
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      if (polling) return;
      
      setPolling(true);
      setLoading(true);
      
      // Get API base URL from environment or use default
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      
      // Fetch elections from the backend
      const response = await electionAPI.getEligibleElections("user123"); // In a real app, this would be the actual user ID
      
      // Fetch live results from blockchain for each active election
      const electionResults: ElectionResult[] = [];
      
      for (const election of response.elections) {
        if (election.isActive || election.isCompleted) {
          try {
            // Fetch live results from the new endpoint
            const liveResponse = await fetch(`${API_BASE_URL}/elections/${election.id}/results/live`);
            
            if (liveResponse.ok) {
              const liveData = await liveResponse.json();
              
              // Calculate total votes
              const totalVotes = liveData.results.candidates.reduce((sum: number, candidate: any) => sum + (candidate.voteCount || 0), 0);
              
              // Transform live results to match our interface
              electionResults.push({
                id: liveData.results.electionId,
                title: liveData.results.title,
                description: liveData.results.description,
                electionType: liveData.results.electionType,
                startDate: liveData.results.startDate,
                endDate: liveData.results.endDate,
                isActive: liveData.results.isActive,
                isCompleted: liveData.results.isCompleted,
                lastUpdated: liveData.results.lastUpdated,
                totalVotes: totalVotes,
                candidates: liveData.results.candidates.map((candidate: any) => ({
                  id: candidate.id,
                  name: candidate.name,
                  party: candidate.party || "Independent",
                  voteCount: candidate.voteCount || 0,
                  percentage: candidate.percentage || 0
                }))
              });
            }
          } catch (err) {
            console.error(`Error fetching live results for election ${election.id}:`, err);
            // Fall back to blockchain results if live endpoint fails
            try {
              const blockchainResults: any = await fetchResultsFromBlockchain(election.id);
              
              // Calculate total votes
              const totalVotes = blockchainResults.candidates.reduce((sum: number, candidate: any) => sum + (candidate.voteCount || 0), 0);
              
              // Transform blockchain results to match our interface
              electionResults.push({
                id: election.id,
                title: election.title,
                description: election.description,
                electionType: election.electionType,
                startDate: election.startDate,
                endDate: election.endDate,
                isActive: election.isActive,
                isCompleted: election.isCompleted,
                lastUpdated: new Date().toISOString(),
                totalVotes: totalVotes,
                candidates: blockchainResults.candidates.map((candidate: any) => ({
                  id: candidate.id,
                  name: candidate.name,
                  party: candidate.party || "Independent",
                  voteCount: candidate.voteCount || 0,
                  percentage: totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 1000) / 10 : 0
                }))
              });
            } catch (blockchainErr) {
              console.error(`Error fetching blockchain results for election ${election.id}:`, blockchainErr);
            }
          }
        }
      }
      
      setResults(electionResults);
    } catch (err: any) {
      setError(err.message || "Failed to fetch results");
    } finally {
      setLoading(false);
      setPolling(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getElectionTypeLabel = (type: string) => {
    switch (type) {
      case "lok-sabha": return "Lok Sabha";
      case "state-assembly": return "State Assembly";
      case "local": return "Local/Municipal";
      default: return type;
    }
  };

  if (loading && results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading live results from blockchain...</p>
        </div>
      </div>
    );
  }

  if (error && results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchResults}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
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
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Live Election Results</h1>
              <p className="text-gray-600 mt-1">Results update in real-time from the blockchain</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <button
                onClick={handleBack}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("current")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "current"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Live Results
                </button>
                <button
                  onClick={() => setActiveTab("historical")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "historical"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Historical Results
                </button>
              </nav>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No live elections with results available at this time.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {results
                  .filter(result => activeTab === "current" ? result.isActive : result.isCompleted)
                  .map((result) => (
                    <div key={result.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">{result.title}</h2>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                              {getElectionTypeLabel(result.electionType)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {result.isActive ? "Ongoing" : "Completed"}
                            </span>
                            <span className="text-sm text-gray-600">
                              Last updated: {new Date(result.lastUpdated).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">Total Votes</p>
                          <p className="text-2xl font-bold text-indigo-600">{result.totalVotes.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {result.candidates
                          .sort((a, b) => b.voteCount - a.voteCount)
                          .map((candidate, index) => (
                            <div key={candidate.id} className="space-y-2">
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  {index === 0 && (
                                    <span className="mr-2 text-yellow-500">🏆</span>
                                  )}
                                  <span className="font-medium text-gray-800">{candidate.name}</span>
                                  <span className="ml-2 text-sm text-gray-600">({candidate.party})</span>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-800">
                                    {candidate.voteCount.toLocaleString()} votes
                                  </p>
                                  <p className="text-sm text-gray-600">{candidate.percentage}%</p>
                                </div>
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-indigo-600 h-2.5 rounded-full"
                                  style={{ width: `${candidate.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}