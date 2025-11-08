"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeVoterId } from "@/app/utils/voterIdDecoder";
import { profileAPI } from "@/app/api";
import { Edit, Save, X, User, Mail, Phone, MapPin, Home, Building, Download, CheckCircle, AlertCircle } from "lucide-react";

interface Address {
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface UserProfile {
  voterId: string;
  name: string;
  email: string;
  phone: string;
  presentAddress: Address;
  permanentAddress: Address;
  district: string;
  constituency: string;
  isAadhaarVerified: boolean;
  isFaceVerified: boolean;
  kycStatus: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const voterId = localStorage.getItem("voterId");
      
      if (!voterId) {
        router.push("/login");
        return;
      }
      
      const response = await profileAPI.getProfile(voterId);
      setProfile(response.profile);
      setFormData(response.profile);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("presentAddress.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        presentAddress: {
          ...(prev.presentAddress || {}),
          [field]: value
        } as Address
      }));
    } else if (name.startsWith("permanentAddress.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        permanentAddress: {
          ...(prev.permanentAddress || {}),
          [field]: value
        } as Address
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const voterId = localStorage.getItem("voterId");
      if (!voterId) {
        throw new Error("Voter ID not found");
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/profile/${voterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      const data = await response.json();
      setProfile(data.profile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
    setError(null);
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleDownloadVoterCard = () => {
    // In a real implementation, this would generate and download a PDF
    alert("Downloading digital voter card...");
  };

  // Decode voter ID information
  const decodedInfo: any = profile ? decodeVoterId(profile.voterId) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const displayData = isEditing ? formData : profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your profile information</p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            {/* Header with QR Code */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{displayData.name || "N/A"}</h2>
                      <p className="mt-1 opacity-90 text-sm font-mono">{displayData.voterId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    {displayData.isAadhaarVerified && (
                      <span className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aadhaar Verified
                      </span>
                    )}
                    {displayData.isFaceVerified && (
                      <span className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Face Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-gray-500 text-xs text-center px-2">
                      QR Code
                      <br />
                      <span className="font-mono">{displayData.voterId?.substring(0, 6)}...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="p-8">
              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-indigo-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={displayData.name || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{displayData.name || "N/A"}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-1 text-gray-500" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={displayData.email || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{displayData.email || "N/A"}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-1 text-gray-500" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={displayData.phone || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{displayData.phone || "N/A"}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Location Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                  Location Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <p className="text-gray-900 font-medium">
                      {decodedInfo?.valid ? decodedInfo.state : displayData.presentAddress?.state || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="district"
                        value={displayData.district || decodedInfo?.district || displayData.presentAddress?.city || ""}
                        onChange={handleInputChange}
                        placeholder="Enter district"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {displayData.district || decodedInfo?.district || displayData.presentAddress?.city || "N/A"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Constituency</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="constituency"
                        value={displayData.constituency || decodedInfo?.constituency || ""}
                        onChange={handleInputChange}
                        placeholder="Enter constituency"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {displayData.constituency || decodedInfo?.constituency || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Addresses */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-indigo-600" />
                  Addresses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Present Address */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Home className="w-4 h-4 mr-2 text-indigo-600" />
                      Present Address
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">House/Flat No.</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="presentAddress.houseNumber"
                              value={displayData.presentAddress?.houseNumber || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <p className="text-gray-900 text-sm">{displayData.presentAddress?.houseNumber || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Street</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="presentAddress.street"
                              value={displayData.presentAddress?.street || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <p className="text-gray-900 text-sm">{displayData.presentAddress?.street || "N/A"}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="presentAddress.city"
                            value={displayData.presentAddress?.city || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <p className="text-gray-900 text-sm">{displayData.presentAddress?.city || "N/A"}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">State</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="presentAddress.state"
                              value={displayData.presentAddress?.state || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <p className="text-gray-900 text-sm">{displayData.presentAddress?.state || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">PIN Code</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="presentAddress.pincode"
                              value={displayData.presentAddress?.pincode || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <p className="text-gray-900 text-sm">{displayData.presentAddress?.pincode || "N/A"}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Country</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="presentAddress.country"
                            value={displayData.presentAddress?.country || "India"}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <p className="text-gray-900 text-sm">{displayData.presentAddress?.country || "India"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Permanent Address */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-indigo-600" />
                      Permanent Address
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">House/Flat No.</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="permanentAddress.houseNumber"
                              value={displayData.permanentAddress?.houseNumber || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <p className="text-gray-900 text-sm">{displayData.permanentAddress?.houseNumber || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Street</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="permanentAddress.street"
                              value={displayData.permanentAddress?.street || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <p className="text-gray-900 text-sm">{displayData.permanentAddress?.street || "N/A"}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="permanentAddress.city"
                            value={displayData.permanentAddress?.city || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <p className="text-gray-900 text-sm">{displayData.permanentAddress?.city || "N/A"}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">State</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="permanentAddress.state"
                              value={displayData.permanentAddress?.state || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <p className="text-gray-900 text-sm">{displayData.permanentAddress?.state || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">PIN Code</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="permanentAddress.pincode"
                              value={displayData.permanentAddress?.pincode || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <p className="text-gray-900 text-sm">{displayData.permanentAddress?.pincode || "N/A"}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Country</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="permanentAddress.country"
                            value={displayData.permanentAddress?.country || "India"}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <p className="text-gray-900 text-sm">{displayData.permanentAddress?.country || "India"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Download Button */}
              <div className="flex justify-center pt-6 border-t border-gray-200">
                <button
                  onClick={handleDownloadVoterCard}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-sm"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Digital Voter Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
