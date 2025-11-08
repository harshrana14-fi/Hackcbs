"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { voteBankAPI, electionAPI } from "@/app/api";

interface VoteRecord {
  id: string;
  electionId: string;
  candidateId: string;
  voterHash: string;
  timestamp: string;
  blockchainHash: string;
  createdAt: string;
}

interface VoteBankData {
  election: {
    id: string;
    title: string;
    description: string;
  };
  totalVotes: number;
  votes: VoteRecord[];
}

interface VoteStats {
  totalVotes: number;
  votesByCandidate: Record<string, number>;
  votesByHour: Record<string, number>;
  votesByDate: Record<string, number>;
  firstVote: string | null;
  lastVote: string | null;
}

export default function VoteBankPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const [voteBank, setVoteBank] = useState<VoteBankData | null>(null);
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bank" | "stats" | "verify">("bank");
  const [verifyVoterId, setVerifyVoterId] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      fetchVoteBank(selectedElectionId);
      fetchVoteStats(selectedElectionId);
    }
  }, [selectedElectionId]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const voterId = typeof window !== 'undefined' ? localStorage.getItem("voterId") : null;
      if (!voterId) {
        router.push("/login");
        return;
      }

      const { decodeVoterId } = await import("@/app/utils/voterIdDecoder");
      const decodedInfo: any = decodeVoterId(voterId);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      
      const response = await fetch(`${API_BASE_URL}/elections/eligible`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: voterId,
          state: decodedInfo.valid ? decodedInfo.state : "Delhi"
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch elections");
      
      const data = await response.json();
      setElections(data.elections || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteBank = async (electionId: string) => {
    try {
      setError(null);
      if (!electionId || electionId.trim() === "") {
        throw new Error("Please select an election first");
      }
      console.log(`🔗 Fetching vote bank for election: ${electionId}`);
      const data = await voteBankAPI.getVoteBank(electionId);
      console.log("✅ Vote bank data received:", data);
      setVoteBank(data);
    } catch (err: any) {
      console.error("❌ Error fetching vote bank:", err);
      const errorMessage = err.message || "Failed to fetch vote bank";
      if (errorMessage.includes("404")) {
        setError("Vote bank endpoint not found. Please restart the backend server to load the new routes.");
      } else {
        setError(errorMessage);
      }
    }
  };

  const fetchVoteStats = async (electionId: string) => {
    try {
      if (!electionId || electionId.trim() === "") {
        return;
      }
      console.log(`📊 Fetching vote stats for election: ${electionId}`);
      const data = await voteBankAPI.getVoteStats(electionId);
      console.log("✅ Vote stats data received:", data);
      if (data && data.statistics) {
        setVoteStats(data.statistics);
      }
    } catch (err: any) {
      console.error("❌ Error fetching vote stats:", err);
      // Don't set error state for stats as it's supplementary data
      if (err.message && err.message.includes("404")) {
        console.warn("⚠️ Vote stats endpoint returned 404. Make sure the backend server has been restarted.");
      }
    }
  };

  const handleVerifyVote = async () => {
    if (!selectedElectionId || !verifyVoterId) {
      setError("Please select an election and enter a voter ID");
      return;
    }

    try {
      setLoading(true);
      const data = await voteBankAPI.verifyVote(selectedElectionId, verifyVoterId);
      setVerifyResult(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to verify vote");
      setVerifyResult(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
  };

  if (loading && !voteBank) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vote bank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Vote Bank Verification
              </h1>
              <p className="text-gray-600">View and verify all votes stored in the blockchain</p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Election Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Election
            </label>
            <select
              value={selectedElectionId || ""}
              onChange={(e) => setSelectedElectionId(e.target.value || null)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select an election --</option>
              {elections.map(election => (
                <option key={election.id} value={election.id}>
                  {election.title} ({election.electionType})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {selectedElectionId && (
            <>
              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab("bank")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === "bank"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Vote Bank
                    </button>
                    <button
                      onClick={() => setActiveTab("stats")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === "stats"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Statistics
                    </button>
                    <button
                      onClick={() => setActiveTab("verify")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === "verify"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Verify Vote
                    </button>
                  </nav>
                </div>
              </div>

              {/* Vote Bank Tab */}
              {activeTab === "bank" && voteBank && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{voteBank.election.title}</h2>
                      <p className="text-gray-600 mt-1">{voteBank.election.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Votes</p>
                      <p className="text-3xl font-bold text-indigo-600">{voteBank.totalVotes}</p>
                    </div>
                  </div>

                  {voteBank.votes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-gray-500">No votes found in the vote bank for this election.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voter Hash</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain Hash</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {voteBank.votes.map((vote) => (
                            <tr key={vote.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <code className="text-xs font-mono text-gray-800">{formatHash(vote.voterHash)}</code>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{vote.candidateId}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <code className="text-xs font-mono text-gray-800">{formatHash(vote.blockchainHash)}</code>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(vote.timestamp)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === "stats" && voteStats && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Vote Statistics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                      <p className="text-indigo-600 font-medium mb-2">Total Votes</p>
                      <p className="text-3xl font-bold text-indigo-700">{voteStats.totalVotes}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <p className="text-green-600 font-medium mb-2">First Vote</p>
                      <p className="text-sm font-semibold text-green-700">
                        {voteStats.firstVote ? formatDate(voteStats.firstVote) : "N/A"}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <p className="text-purple-600 font-medium mb-2">Last Vote</p>
                      <p className="text-sm font-semibold text-purple-700">
                        {voteStats.lastVote ? formatDate(voteStats.lastVote) : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Votes by Candidate</h3>
                    <div className="space-y-3">
                      {Object.entries(voteStats.votesByCandidate).map(([candidate, count]) => (
                        <div key={candidate} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-800">{candidate}</span>
                          <span className="text-lg font-bold text-indigo-600">{count} votes</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Votes by Date</h3>
                    <div className="space-y-2">
                      {Object.entries(voteStats.votesByDate).map(([date, count]) => (
                        <div key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">{date}</span>
                          <span className="font-semibold text-indigo-600">{count} votes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Verify Vote Tab */}
              {activeTab === "verify" && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify Vote</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Voter ID to Verify
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={verifyVoterId}
                        onChange={(e) => setVerifyVoterId(e.target.value.toUpperCase())}
                        placeholder="e.g., VCUP000025NHCVPU5"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        onClick={handleVerifyVote}
                        disabled={loading || !verifyVoterId}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                  </div>

                  {verifyResult && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xl">✓</span>
                        </div>
                        <h3 className="text-lg font-semibold text-green-800">Vote Verified</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Election</p>
                            <p className="font-semibold text-gray-800">{verifyResult.vote.electionTitle}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Candidate</p>
                            <p className="font-semibold text-gray-800">{verifyResult.vote.candidateName} ({verifyResult.vote.candidateParty})</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Voter Hash</p>
                            <p className="font-mono text-xs text-gray-800">{formatHash(verifyResult.vote.voterHash)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Blockchain Hash</p>
                            <p className="font-mono text-xs text-gray-800">{formatHash(verifyResult.vote.blockchainHash)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Timestamp</p>
                            <p className="font-semibold text-gray-800">{formatDate(verifyResult.vote.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!selectedElectionId && (
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Select an Election</h3>
              <p className="text-gray-600">Choose an election from the dropdown above to view its vote bank</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

