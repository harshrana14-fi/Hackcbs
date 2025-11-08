"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoterProfileCard from "@/components/VoterProfileCard";
import ElectionCard from "@/components/ElectionCard";
import { electionAPI, votingHistoryAPI } from "../api";
import Link from "next/link";
import { decodeVoterId } from "@/app/utils/voterIdDecoder";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Vote, 
  BarChart3, 
  FileCheck, 
  User, 
  History, 
  TrendingUp, 
  Check, 
  Calendar, 
  AlertTriangle, 
  ClipboardList,
  Home
} from "lucide-react";

interface Election {
  id: string;
  title: string;
  description: string;
  endDate: string;
  electionType: string;
  state: string;
  district: string;
  constituency: string;
  isActive: boolean;
  isCompleted: boolean;
  userHasVoted: boolean;
  startDate?: string; // Add startDate field
}

// Add interface for voting history
interface VotingHistoryItem {
  id: string;
  electionId: string;
  electionTitle: string;
  electionType: string;
  candidateId: string;
  timestamp: string;
  blockchainHash: string;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [voterId, setVoterId] = useState<string | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
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
      fetchEligibleElections(storedVoterId);
      fetchVotingHistory(storedVoterId);
    }
    
    // Refresh elections when page becomes visible (e.g., after returning from vote page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && storedVoterId) {
        fetchEligibleElections(storedVoterId);
        fetchVotingHistory(storedVoterId);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh on focus
    const handleFocus = () => {
      if (storedVoterId) {
        fetchEligibleElections(storedVoterId);
        fetchVotingHistory(storedVoterId);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);

  const fetchEligibleElections = async (voterId: string) => {
    try {
      setLoading(true);
      
      // Decode voter ID to get location information
      const decodedInfo: any = decodeVoterId(voterId);
      
      // Get API base URL from environment or use default
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      
      // Fetch elections from the backend API
      const response = await fetch(`${API_BASE_URL}/elections/eligible`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId: voterId,
          state: decodedInfo.valid ? decodedInfo.state : "Delhi"
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch elections");
      }
      
      const data = await response.json();
      
      // Transform the data to match our Election interface
      const elections: Election[] = data.elections.map((election: any) => ({
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: new Date(election.startDate).toLocaleDateString(),
        endDate: new Date(election.endDate).toLocaleDateString(),
        electionType: election.electionType,
        state: election.state,
        district: election.district || "",
        constituency: election.constituency || "",
        isActive: election.isActive,
        isCompleted: election.isCompleted,
        userHasVoted: election.userHasVoted || false // Use the value from backend
      }));
      
      setElections(elections);
    } catch (err: any) {
      setError(err.message || "Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingHistory = async (voterId: string) => {
    try {
      const history = await votingHistoryAPI.getVotingHistory(voterId);
      setVotingHistory(history.votingHistory);
    } catch (err: any) {
      console.error("Error fetching voting history:", err);
      // Don't set error state as this is supplementary data
    }
  };

  const handleLogout = () => {
    // Remove voter ID from localStorage
    localStorage.removeItem("voterId");
    // Redirect to home page
    router.push("/");
  };

  if (!voterId) {
    return null; // Don't render anything while checking auth status
  }

  // Sample stats data - in a real app, this would come from the backend
  const stats = {
    totalVotesCast: votingHistory.length,
    upcomingEvents: elections.filter(e => !e.userHasVoted).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {t("dashboard.welcomeBack")}
              </h1>
              <p className="text-gray-600">{t("dashboard.manageVoting")}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="relative group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                title="Go to homepage"
              >
                <Home className="w-5 h-5" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Go to homepage
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                {t("common.logout")}
              </button>
            </div>
          </div>
          
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Link 
              href="/dashboard/vote" 
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <h3 className="ml-4 font-bold text-gray-800 text-lg">{t("dashboard.vote")}</h3>
              </div>
              <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{t("dashboard.voteDesc")}</p>
            </Link>
            
            <Link 
              href="/dashboard/results" 
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="ml-4 font-bold text-gray-800 text-lg">{t("dashboard.results")}</h3>
              </div>
              <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{t("dashboard.resultsDesc")}</p>
            </Link>
            
            <Link 
              href="/dashboard/kyc" 
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="ml-4 font-bold text-gray-800 text-lg">{t("dashboard.kycStatus")}</h3>
              </div>
              <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{t("dashboard.kycStatusDesc")}</p>
            </Link>
            
            <Link 
              href="/dashboard/profile" 
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="ml-4 font-bold text-gray-800 text-lg">{t("dashboard.profile")}</h3>
              </div>
              <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{t("dashboard.profileDesc")}</p>
            </Link>
            
            <Link 
              href="/dashboard/history" 
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <History className="w-6 h-6 text-white" />
                </div>
                <h3 className="ml-4 font-bold text-gray-800 text-lg">{t("dashboard.history")}</h3>
              </div>
              <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{t("dashboard.historyDesc")}</p>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Voter Profile Card */}
            <div className="lg:col-span-1">
              <VoterProfileCard 
                voterId={voterId}
                aadhaarVerified={true}
                faceVerified={true}
              />
            </div>
            
            {/* Stats and Quick Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{t("dashboard.quickStats")}</h2>
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-4xl font-bold text-indigo-700">{stats.totalVotesCast}</div>
                      <div className="w-12 h-12 bg-indigo-200 rounded-lg flex items-center justify-center">
                        <Check className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="text-indigo-700 font-semibold">{t("dashboard.totalVotesCast")}</div>
                    <div className="text-xs text-indigo-600 mt-1">{t("dashboard.votingParticipation")}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-4xl font-bold text-green-700">{stats.upcomingEvents}</div>
                      <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="text-green-700 font-semibold">{t("dashboard.upcomingEvents")}</div>
                    <div className="text-xs text-green-600 mt-1">{t("dashboard.electionsYouCanVote")}</div>
                  </div>
                </div>
              </div>
              
              {/* Ongoing Elections Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{t("dashboard.ongoingElections")}</h2>
                  <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                    {elections.filter(election => !election.userHasVoted && election.isActive).length} {t("dashboard.active")}
                  </div>
                </div>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                    <div className="text-gray-500">{t("dashboard.loadingElections")}</div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <div className="text-red-600 font-semibold">{t("dashboard.errorLoadingElections")}</div>
                    <div className="text-red-500 text-sm mt-1">{error}</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {elections
                      .filter(election => !election.userHasVoted && election.isActive)
                      .map(election => (
                        <ElectionCard
                          key={election.id}
                          title={election.title}
                          description={election.description}
                          endDate={election.endDate}
                          status="ongoing"
                          userVoteStatus="not-voted"
                          electionId={election.id}
                        />
                      ))}
                    
                    {elections.filter(election => !election.userHasVoted && election.isActive).length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                        <Vote className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                        <div className="text-gray-600 font-medium">{t("dashboard.noOngoingElections")}</div>
                        <div className="text-gray-500 text-sm mt-1">{t("dashboard.checkBackLater")}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* All Elections */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{t("dashboard.allElections")}</h2>
              <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                {elections.length} {t("dashboard.total")}
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <div className="text-gray-500">{t("dashboard.loadingElections")}</div>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <div className="text-red-600 font-semibold">{t("dashboard.errorLoadingElections")}</div>
                <div className="text-red-500 text-sm mt-1">{error}</div>
              </div>
            ) : elections.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-600 font-medium">{t("dashboard.noElectionsFound")}</div>
                <div className="text-gray-500 text-sm mt-1">{t("dashboard.electionsWillAppear")}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {elections.map(election => (
                  <ElectionCard
                    key={election.id}
                    title={election.title}
                    description={election.description}
                    endDate={election.endDate}
                    status={election.userHasVoted ? "completed" : "ongoing"}
                    userVoteStatus={election.userHasVoted ? "voted" : "not-voted"}
                    electionId={election.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}