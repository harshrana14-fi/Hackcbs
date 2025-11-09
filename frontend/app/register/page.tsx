"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationProgress from "@/components/RegistrationProgress";
import { useState } from "react";
import { registerAPI } from "../api";
import { useLanguage } from "@/contexts/LanguageContext";

type Address = {
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type FormState = {
  name: string;
  age: string;
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
  presentAddress: Address;
  permanentAddress: Address;
  isSameAsPermanent: boolean;
  addressProofType: string;
  occupation: string;
  district: string;
  constituency: string;
};

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>({
    name: "",
    age: "",
    fatherName: "",
    motherName: "",
    phone: "",
    email: "",
    presentAddress: {
      houseNumber: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    permanentAddress: {
      houseNumber: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    isSameAsPermanent: false,
    addressProofType: "",
    occupation: "",
    district: "",
    constituency: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    // Handle nested address fields
    if (name.startsWith('presentAddress.') || name.startsWith('permanentAddress.')) {
      const [addressType, field] = name.split('.');
      setFormData({
        ...formData,
        [addressType]: {
          ...formData[addressType as keyof FormState] as Address,
          [field]: value
        }
      });
    } else if (name === 'isSameAsPermanent') {
      setFormData({
        ...formData,
        isSameAsPermanent: checked!
      });
      
      // If same as permanent, copy present address to permanent
      if (checked) {
        setFormData(prev => ({
          ...prev,
          permanentAddress: { ...prev.presentAddress }
        }));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (error) setError(null);
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        age: parseInt(formData.age),
      };
      
      // Save personal details to backend
      const response = await registerAPI.savePersonalDetails(submissionData);
      
      // Store user ID in localStorage for subsequent steps
      if (response.user && response.user.id) {
        localStorage.setItem("registrationUserId", response.user.id);
      }
      
      // Navigate to next step
      router.push("/register/aadhaar");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to save personal details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Navbar />
      <RegistrationProgress step={1} />
      <main className="flex-grow flex items-start justify-center py-12 px-4 pt-32">
        <div className="w-full max-w-4xl">
          <section className="bg-white rounded border border-[#E0E0E0] shadow-md govt-card overflow-hidden">
            <header className="px-8 py-6 border-b-2 border-[#FF9933] bg-[#002147] flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white govt-heading">
                  {t("register.personalDetails")}
                </h1>
                <p className="text-sm text-white/80 mt-1">
                  {t("register.fillDetails")}
                </p>
              </div>
              <div className="text-sm text-white font-semibold bg-[#FF9933] text-[#002147] px-4 py-2 rounded">{t("register.step1of4")}</div>
            </header>

            <form onSubmit={handleNext} className="px-8 py-8 space-y-8">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border-2 border-red-200 p-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col">
                  <span className="text-sm text-[#002147] font-semibold mb-2">
                    {t("register.fullName")} *
                  </span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    aria-label="Full name"
                    className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                    placeholder="e.g., John Doe"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium mb-2">
                    {t("register.age")} *
                  </span>
                  <input
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min={1}
                    aria-label="Age"
                    className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                    placeholder="e.g., 30"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium mb-2">
                    {t("register.phoneNumber")} *
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    aria-label="Phone number"
                    className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                    placeholder="+91 98765 43210"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium mb-2">
                    {t("register.emailId")} *
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    aria-label="Email"
                    className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              {/* Present Address Section */}
              <div className="border-2 border-[#E0E0E0] rounded p-6 bg-[#F5F5F5]">
                <h2 className="text-xl font-bold text-[#002147] mb-4 govt-heading">{t("register.presentAddress")}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <label className="flex flex-col">
                    <span className="text-sm text-[#002147] font-semibold mb-2">
                      House/Flat Number *
                    </span>
                    <input
                      name="presentAddress.houseNumber"
                      value={formData.presentAddress.houseNumber}
                      onChange={handleChange}
                      required
                      aria-label="House/Flat Number"
                      className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                      placeholder="e.g., 123"
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-sm text-[#002147] font-semibold mb-2">
                      Street/Area *
                    </span>
                    <input
                      name="presentAddress.street"
                      value={formData.presentAddress.street}
                      onChange={handleChange}
                      required
                      aria-label="Street/Area"
                      className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                      placeholder="e.g., Main Street"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <label className="flex flex-col">
                    <span className="text-sm text-[#002147] font-semibold mb-2">
                      City *
                    </span>
                    <input
                      name="presentAddress.city"
                      value={formData.presentAddress.city}
                      onChange={handleChange}
                      required
                      aria-label="City"
                      className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                      placeholder="e.g., Mumbai"
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-sm text-[#002147] font-semibold mb-2">
                      State *
                    </span>
                    <input
                      name="presentAddress.state"
                      value={formData.presentAddress.state}
                      onChange={handleChange}
                      required
                      aria-label="State"
                      className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                      placeholder="e.g., Maharashtra"
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-sm text-[#002147] font-semibold mb-2">
                      PIN Code *
                    </span>
                    <input
                      name="presentAddress.pincode"
                      value={formData.presentAddress.pincode}
                      onChange={handleChange}
                      required
                      aria-label="PIN Code"
                      className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                      placeholder="e.g., 400001"
                    />
                  </label>
                </div>

                <label className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium mb-2">
                    Country
                  </span>
                  <input
                    name="presentAddress.country"
                    value={formData.presentAddress.country}
                    onChange={handleChange}
                    aria-label="Country"
                    className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                    placeholder="e.g., India"
                  />
                </label>
              </div>

              {/* Permanent Address Section */}
              <div className="border-2 border-[#E0E0E0] rounded p-6 bg-[#F5F5F5]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#002147] govt-heading">Permanent Address</h2>
                  <label className="flex items-center text-sm text-[#002147] font-medium">
                    <input
                      name="isSameAsPermanent"
                      type="checkbox"
                      checked={formData.isSameAsPermanent}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-[#002147] rounded focus:ring-[#002147] border-2 border-[#E0E0E0]"
                    />
                    Same as Present Address
                  </label>
                </div>
                
                {!formData.isSameAsPermanent && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <label className="flex flex-col">
                        <span className="text-sm text-[#002147] font-semibold mb-2">
                          House/Flat Number *
                        </span>
                        <input
                          name="permanentAddress.houseNumber"
                          value={formData.permanentAddress.houseNumber}
                          onChange={handleChange}
                          required={!formData.isSameAsPermanent}
                          aria-label="House/Flat Number"
                          className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                          placeholder="e.g., 123"
                        />
                      </label>

                      <label className="flex flex-col">
                        <span className="text-sm text-[#002147] font-semibold mb-2">
                          Street/Area *
                        </span>
                        <input
                          name="permanentAddress.street"
                          value={formData.permanentAddress.street}
                          onChange={handleChange}
                          required={!formData.isSameAsPermanent}
                          aria-label="Street/Area"
                          className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                          placeholder="e.g., Main Street"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <label className="flex flex-col">
                        <span className="text-sm text-[#002147] font-semibold mb-2">
                          City *
                        </span>
                        <input
                          name="permanentAddress.city"
                          value={formData.permanentAddress.city}
                          onChange={handleChange}
                          required={!formData.isSameAsPermanent}
                          aria-label="City"
                          className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                          placeholder="e.g., Mumbai"
                        />
                      </label>

                      <label className="flex flex-col">
                        <span className="text-sm text-[#002147] font-semibold mb-2">
                          State *
                        </span>
                        <input
                          name="permanentAddress.state"
                          value={formData.permanentAddress.state}
                          onChange={handleChange}
                          required={!formData.isSameAsPermanent}
                          aria-label="State"
                          className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                          placeholder="e.g., Maharashtra"
                        />
                      </label>

                      <label className="flex flex-col">
                        <span className="text-sm text-[#002147] font-semibold mb-2">
                          PIN Code *
                        </span>
                        <input
                          name="permanentAddress.pincode"
                          value={formData.permanentAddress.pincode}
                          onChange={handleChange}
                          required={!formData.isSameAsPermanent}
                          aria-label="PIN Code"
                          className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                          placeholder="e.g., 400001"
                        />
                      </label>
                    </div>

                    <label className="flex flex-col">
                      <span className="text-sm text-[#002147] font-semibold mb-2">
                        Country
                      </span>
                      <input
                        name="permanentAddress.country"
                        value={formData.permanentAddress.country}
                        onChange={handleChange}
                        aria-label="Country"
                        className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                        placeholder="e.g., India"
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Address Proof Section */}
              <div className="border-2 border-[#E0E0E0] rounded p-6 bg-[#F5F5F5]">
                <h2 className="text-xl font-bold text-[#002147] mb-4 govt-heading">Address Proof</h2>
                
                <label className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium mb-2">
                    Address Proof Type *
                  </span>
                  <select
                    name="addressProofType"
                    value={formData.addressProofType}
                    onChange={handleChange}
                    required
                    aria-label="Address Proof Type"
                    className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                  >
                    <option value="">Select address proof</option>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="voter_id">Voter ID</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="rent_agreement">Rent Agreement</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                
                <p className="text-sm text-slate-400 mt-2">
                  Note: You'll be asked to upload the document in the next steps.
                </p>
              </div>

              {/* District and Constituency Section */}
              <div className="border-2 border-[#E0E0E0] rounded p-6 bg-[#F5F5F5]">
                <h2 className="text-xl font-bold text-[#002147] mb-4 govt-heading">Electoral Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col">
                    <span className="text-sm text-[#002147] font-semibold mb-2">
                      District *
                    </span>
                    <input
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      aria-label="District"
                      className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                      placeholder="e.g., Mumbai"
                    />
                    <p className="text-xs text-[#4A4A4A] mt-1">
                      District where you are registered to vote
                    </p>
                  </label>

                  <label className="flex flex-col">
                    <span className="text-sm text-[#002147] font-semibold mb-2">
                      Constituency *
                    </span>
                    <input
                      name="constituency"
                      value={formData.constituency}
                      onChange={handleChange}
                      required
                      aria-label="Constituency"
                      className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                      placeholder="e.g., Mumbai South"
                    />
                    <p className="text-xs text-[#4A4A4A] mt-1">
                      Your electoral constituency
                    </p>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium mb-2">
                    Father's Name *
                  </span>
                  <input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                    aria-label="Father's name"
                    className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                    placeholder="Father's full name"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium mb-2">
                    Mother's Name *
                  </span>
                  <input
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    required
                    aria-label="Mother's name"
                    className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                    placeholder="Mother's full name"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium mb-2">
                    Occupation
                  </span>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    aria-label="Occupation"
                    className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-[#002147] transition"
                  >
                    <option value="">Select occupation</option>
                    <option value="student">Student</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-employed</option>
                    <option value="retired">Retired</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-3 bg-white border-2 border-[#002147] text-[#002147] rounded hover:bg-[#F5F5F5] transition font-semibold"
                  disabled={loading}
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="ml-auto px-6 py-3 bg-[#002147] text-white font-semibold rounded shadow-lg hover:bg-[#003A6B] transition disabled:opacity-50 border-2 border-[#FF9933]"
                  disabled={loading}
                >
                  {loading ? t("register.saving") : t("register.continueToAadhaar")}
                </button>
              </div>
            </form>
          </section>

          <p className="text-xs text-[#4A4A4A] mt-3 text-center">
            {t("register.agreeTerms")}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}