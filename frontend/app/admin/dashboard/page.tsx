"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminAPI } from "@/app/api";
import { Plus, X, Trash2, Edit, CheckCircle, Clock, AlertCircle, Users, Calendar, MapPin, Database, Home } from "lucide-react";

interface ElectionForm {
  title: string;
  description: string;
  electionType: string;
  state: string;
  district: string;
  constituency: string;
  startDate: string;
  endDate: string;
}

interface CandidateForm {
  name: string;
  party: string;
  electionId: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  electionType: string;
  state: string;
  district: string;
  constituency: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  candidates: Candidate[];
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  voteCount: number;
}

export default function AdminDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [expandedElections, setExpandedElections] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<ElectionForm>({
    title: "",
    description: "",
    electionType: "lok-sabha",
    state: "",
    district: "",
    constituency: "",
    startDate: "",
    endDate: ""
  });
  const [candidateData, setCandidateData] = useState<CandidateForm>({
    name: "",
    party: "",
    electionId: ""
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getElections();
      
      const electionsData = response.elections || [];
      
      // Ensure candidates array exists and is properly formatted
      const formattedElections = electionsData.map((election: any) => {
        const candidates = Array.isArray(election.candidates) ? election.candidates : [];
        
        return {
          ...election,
          candidates: candidates.map((c: any) => ({
            id: c.id || c._id?.toString() || `temp-${Date.now()}`,
            name: c.name || "",
            party: c.party || "",
            voteCount: c.voteCount || 0
          })),
          startDate: election.startDate || "",
          endDate: election.endDate || ""
        };
      });
      
      setElections(formattedElections);
    } catch (err: any) {
      console.error("Error fetching elections:", err);
      setError(err.message || "Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCandidateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCandidateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await adminAPI.createElection(formData);
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        electionType: "lok-sabha",
        state: "",
        district: "",
        constituency: "",
        startDate: "",
        endDate: ""
      });
      
      fetchElections();
      showSuccess("Election created successfully!");
    } catch (err: any) {
      showError("Failed to create election: " + (err.message || "Please try again"));
    }
  };

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await adminAPI.addCandidate(candidateData.electionId, {
        name: candidateData.name,
        party: candidateData.party
      });
      
      // Update the specific election in state immediately
      if (response.election && response.election.candidates) {
        setElections(prevElections => {
          const updated = prevElections.map(election => {
            if (election.id === candidateData.electionId) {
              const updatedElection = {
                ...election,
                candidates: response.election.candidates.map((c: any) => ({
                  id: c.id || c._id?.toString() || `temp-${Date.now()}`,
                  name: c.name || "",
                  party: c.party || "",
                  voteCount: c.voteCount || 0
                }))
              };
              return updatedElection;
            }
            return election;
          });
          return updated;
        });
        
        // Ensure the election is expanded to show the new candidate
        setExpandedElections(prev => new Set(prev).add(candidateData.electionId));
      }
      
      setShowCandidateForm(false);
      setCandidateData({
        name: "",
        party: "",
        electionId: ""
      });
      
      // Also refresh all elections to ensure consistency
      setTimeout(() => {
        fetchElections();
      }, 500);
      
      showSuccess("Candidate added successfully!");
    } catch (err: any) {
      console.error("Error adding candidate:", err);
      showError("Failed to add candidate: " + (err.message || "Please try again"));
    }
  };

  const handleRemoveCandidate = async (electionId: string, candidateId: string) => {
    if (!confirm("Are you sure you want to remove this candidate?")) {
      return;
    }
    
    try {
      await adminAPI.removeCandidate(electionId, candidateId);
      fetchElections();
      showSuccess("Candidate removed successfully!");
    } catch (err: any) {
      showError("Failed to remove candidate: " + (err.message || "Please try again"));
    }
  };

  const handleLogout = () => {
    router.push("/");
  };

  const endElection = async (electionId: string) => {
    if (!confirm("Are you sure you want to end this election? This action cannot be undone.")) {
      return;
    }
    
    try {
      await adminAPI.endElection(electionId);
      fetchElections();
      showSuccess("Election ended successfully!");
    } catch (err: any) {
      showError("Failed to end election: " + (err.message || "Please try again"));
    }
  };

  const toggleElectionExpand = (electionId: string) => {
    setExpandedElections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(electionId)) {
        newSet.delete(electionId);
      } else {
        newSet.add(electionId);
      }
      return newSet;
    });
  };

  const handleAddCandidateClick = (electionId: string) => {
    setSelectedElectionId(electionId);
    setCandidateData(prev => ({ ...prev, electionId }));
    setShowCandidateForm(true);
    // Expand the election to show candidates
    setExpandedElections(prev => new Set(prev).add(electionId));
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const getStatusBadge = (election: Election) => {
    if (election.isCompleted) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    } else if (election.isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage elections and candidates</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="relative group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
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
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {successMessage}
              </span>
              <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
              <span className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </span>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                <X className="w-4 h-4" />
            </button>
          </div>
          )}

          {/* Admin Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Elections
              </Link>
              <Link
                href="/dashboard/vote-bank"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Vote Bank
              </Link>
            </div>
          </div>

          {/* Create Election Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Elections</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setFormData({
                      title: "",
                      description: "",
                      electionType: "lok-sabha",
                      state: "",
                      district: "",
                      constituency: "",
                      startDate: "",
                      endDate: ""
                    });
                  }
                }}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showForm ? "Cancel" : "Create New Election"}
              </button>
            </div>
            
            {showForm && (
              <form onSubmit={handleSubmit} className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Election</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Election Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Lok Sabha Elections 2025"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Election Type *
                    </label>
                    <select
                      name="electionType"
                      value={formData.electionType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="lok-sabha">Lok Sabha</option>
                      <option value="state-assembly">State Assembly</option>
                      <option value="local">Local/Municipal</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe the election..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Delhi"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Constituency
                    </label>
                    <input
                      type="text"
                      name="constituency"
                      value={formData.constituency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Mumbai South"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                  >
                    Create Election
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Elections List */}
          <div className="space-y-4">
            {elections.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No elections found. Create your first election to get started.</p>
              </div>
            ) : (
              elections.map((election) => (
                <div key={election.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Election Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleElectionExpand(election.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{election.title}</h3>
                          {getStatusBadge(election)}
                        </div>
                        <p className="text-gray-600 mb-3">{election.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {election.state}
                            {election.district && `, ${election.district}`}
                            {election.constituency && ` - ${election.constituency}`}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {election.startDate} to {election.endDate}
                          </span>
                          <span className={`flex items-center ${Array.isArray(election.candidates) && election.candidates.length > 0 ? 'text-indigo-600 font-semibold' : ''}`}>
                            <Users className="w-4 h-4 mr-1" />
                            {Array.isArray(election.candidates) ? election.candidates.length : 0} Candidates
                            {Array.isArray(election.candidates) && election.candidates.length > 0 && !expandedElections.has(election.id) && (
                              <span className="ml-2 text-xs text-indigo-500">(Click to view)</span>
                            )}
                          </span>
                        </div>
                        </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCandidateClick(election.id);
                          }}
                          className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Candidate
                        </button>
                        {!election.isCompleted && election.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              endElection(election.id);
                            }}
                            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            End Election
                          </button>
                        )}
                      </div>
            </div>
          </div>
          
                  {/* Candidates Section (Expandable) */}
                  {expandedElections.has(election.id) && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Candidates ({Array.isArray(election.candidates) ? election.candidates.length : 0})
                        </h4>
                        {showCandidateForm && candidateData.electionId === election.id && (
                          <button
                            onClick={() => {
                              setShowCandidateForm(false);
                              setCandidateData({ name: "", party: "", electionId: "" });
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                  </div>
                  
                      {/* Add Candidate Form */}
                      {showCandidateForm && candidateData.electionId === election.id && (
                        <form onSubmit={handleCandidateSubmit} className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Candidate Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={candidateData.name}
                      onChange={handleCandidateInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Rajesh Kumar"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party *
                    </label>
                    <input
                      type="text"
                      name="party"
                      value={candidateData.party}
                      onChange={handleCandidateInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Bharatiya Janata Party"
                    />
                  </div>
                </div>
                
                          <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                              onClick={() => {
                                setShowCandidateForm(false);
                                setCandidateData({ name: "", party: "", electionId: "" });
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Add Candidate
                  </button>
                </div>
              </form>
            )}
            
                      {/* Debug Info */}
                      <div className="mb-4 text-xs text-gray-500">
                        Debug: candidates array type: {Array.isArray(election.candidates) ? 'array' : typeof election.candidates}, 
                        length: {Array.isArray(election.candidates) ? election.candidates.length : 'N/A'}
                      </div>

                      {/* Candidates List */}
                      {(() => {
                        const candidates = Array.isArray(election.candidates) ? election.candidates : [];
                        const hasCandidates = candidates.length > 0;
                        
                        if (!hasCandidates) {
                          return (
                            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No candidates added yet.</p>
                              <button
                                onClick={() => handleAddCandidateClick(election.id)}
                                className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                              >
                                Add your first candidate
                              </button>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {candidates.map((candidate: Candidate, index: number) => {
                              // Ensure we have a valid ID for the candidate
                              const candidateId = candidate.id || `candidate-${index}`;
                              
                              return (
                                <div key={candidateId} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-900">{candidate.name || "Unknown"}</h5>
                                      <p className="text-sm text-gray-600 mt-1">{candidate.party || "No party"}</p>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveCandidate(election.id, candidateId)}
                                      className="text-red-600 hover:text-red-800 p-1"
                                      title="Remove candidate"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">Votes</span>
                                    <span className="font-semibold text-indigo-600">{candidate.voteCount || 0}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
