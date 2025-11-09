"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle, Vote, Shield, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { t } = useLanguage();
  return (
    <div className="bg-[#F5F5F5] text-[#1a1a1a] min-h-screen">
      <Navbar/>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center bg-white px-6 overflow-hidden pt-32 md:pt-36">
  {/* Professional Background Pattern */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 2px 2px, rgb(30 58 138) 1px, transparent 0)`,
      backgroundSize: '48px 48px'
    }}></div>
  </div>

  {/* Subtle Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30"></div>

  {/* Official Government Seal */}
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
    className="mb-6 z-10"
  >
    <div className="w-24 h-24 rounded-full bg-white border-4 border-[#002147] flex items-center justify-center shadow-xl">
      <div className="w-20 h-20 rounded-full border-3 border-[#002147] relative flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-[#002147]">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 2 L12 22 M2 12 L22 12" stroke="currentColor" strokeWidth="1"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
        </svg>
      </div>
    </div>
  </motion.div>

  {/* Official Badge with Tricolor */}
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="mb-6 z-10"
  >
    <div className="inline-flex flex-col items-center gap-2">
      <div className="w-32 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded"></div>
      <span className="inline-flex items-center gap-2 bg-[#002147] text-white px-6 py-2 text-sm font-semibold uppercase tracking-wider border-2 border-[#FF9933]">
        <Shield className="w-4 h-4" />
        Official Government Portal
      </span>
      <div className="text-xs text-[#4A4A4A] font-medium">
        भारत सरकार | Government of India
      </div>
    </div>
  </motion.div>

  {/* Main Heading */}
  <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.3 }}
    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 z-10 leading-tight text-[#002147] govt-heading"
  >
    Digital Voting System
      <div className="text-2xl md:text-3xl lg:text-4xl mt-2 text-[#4A4A4A] font-normal">
        भारत निर्वाचन आयोग
      </div>
  </motion.h1>

  {/* Subheading */}
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.8 }}
    className="text-base md:text-lg max-w-3xl mb-8 z-10 text-[#4A4A4A] leading-relaxed font-normal"
  >
    Secure, Transparent, and Accessible Digital Voting Platform for All Citizens of India
  </motion.p>

  {/* Trust Indicators */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.8 }}
    className="flex flex-wrap justify-center gap-6 mb-10 z-10"
  >
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="font-medium">{t("home.encryption")}</span>
    </div>
    
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="font-medium">{t("home.certified")}</span>
    </div>
    
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      </div>
      <span className="font-medium">{t("home.accessible")}</span>
    </div>
    
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="font-medium">{t("home.audited")}</span>
    </div>
  </motion.div>

  {/* CTA Buttons */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.8 }}
    className="flex flex-col sm:flex-row gap-4 z-10 mb-8"
  >
    <motion.a
      href="/register"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#002147] text-white font-semibold px-8 py-4 rounded shadow-lg hover:bg-[#003A6B] transition-all flex items-center justify-center gap-2 border-2 border-[#FF9933]"
    >
      <Vote className="w-5 h-5" />
      {t("home.registerToVote")}
    </motion.a>
    
    <motion.a
      href="/login"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white border-2 border-[#002147] text-[#002147] font-semibold px-8 py-4 rounded hover:bg-[#F5F5F5] transition-all flex items-center justify-center gap-2"
    >
      <Users className="w-5 h-5" />
      {t("navbar.login")}
    </motion.a>
    
    <motion.a
      href="#how-it-works"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white border-2 border-[#4A4A4A] text-[#4A4A4A] font-semibold px-8 py-4 rounded hover:bg-[#F5F5F5] transition-all flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      {t("home.howItWorks")}
    </motion.a>
  </motion.div>

  {/* Voter Guide Modal */}
  {isGuideOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsGuideOpen(false)} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-200 p-6 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voter-guide-title"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 id="voter-guide-title" className="text-xl font-semibold text-gray-900">{t("home.voterGuideTitle")}</h3>
          <button
            type="button"
            onClick={() => setIsGuideOpen(false)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            aria-label={t("common.close")}
          >
            ✕
          </button>
        </div>
        <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700">
          <li>{t("home.voterGuideSteps.step1")}</li>
          <li>{t("home.voterGuideSteps.step2")}</li>
          <li>{t("home.voterGuideSteps.step3")}</li>
          <li>{t("home.voterGuideSteps.step4")}</li>
          <li>{t("home.voterGuideSteps.step5")}</li>
        </ol>
        <div className="mt-5 flex items-center justify-end gap-3">
          <a href="/register" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700">{t("common.register")}</a>
          <button
            type="button"
            onClick={() => setIsGuideOpen(false)}
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50"
          >
            {t("common.close")}
          </button>
        </div>
      </motion.div>
    </div>
  )}

 

  {/* Bottom Notice */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1, duration: 0.8 }}
    className="mt-4 z-10"
  >
    <p className="text-sm text-gray-500 flex items-center gap-2">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      {t("home.securityNotice")}
    </p>
  </motion.div>
</section>

      {/* How It Works Section */}
<section id="how-it-works" className="py-20 px-6 md:px-20 bg-white border-t-2 border-[#E0E0E0]">
  <div className="max-w-7xl mx-auto">
    {/* Section Header */}
    <div className="text-center mb-16">
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4"
      >
        {t("home.simpleProcess")}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
      >
        {t("home.howDigitalVotingWorks")}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg text-gray-600 max-w-2xl mx-auto"
      >
        {t("home.castVoteSteps")}
      </motion.p>
    </div>

    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Left Side - Steps */}
      <div className="space-y-8">
        {[
          {
            number: "01",
            title: t("home.registerVerify"),
            icon: (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            ),
            desc: t("home.registerVerifyDesc"),
            features: [t("home.registerVerifyFeatures.govIdVerification"), t("home.registerVerifyFeatures.biometricAuth"), t("home.registerVerifyFeatures.secureCredentials")]
          },
          {
            number: "02",
            title: t("home.castYourVote"),
            icon: (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ),
            desc: t("home.castYourVoteDesc"),
            features: [t("home.castYourVoteFeatures.e2eEncryption"), t("home.castYourVoteFeatures.blockchainRecording"), t("home.castYourVoteFeatures.instantConfirmation")]
          },
          {
            number: "03",
            title: t("home.verifyTrack"),
            icon: (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ),
            desc: t("home.verifyTrackDesc"),
            features: [t("home.verifyTrackFeatures.anonymousVerification"), t("home.verifyTrackFeatures.realtimeTracking"), t("home.verifyTrackFeatures.tamperProof")]
          },
        ].map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="relative"
          >
            {/* Connector Line */}
            {idx < 2 && (
              <div className="absolute left-6 top-20 w-0.5 h-16 bg-gradient-to-b from-blue-300 to-transparent"></div>
            )}
            
            <div className="flex gap-6">
              {/* Number Badge */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-900 flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                
                {/* Features List */}
                <div className="ml-16 mt-4 space-y-2">
                  {step.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right Side - Phone Mockup */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative lg:sticky lg:top-24"
      >
        {/* Phone Frame */}
        <div className="relative mx-auto w-[320px] h-[650px]">
          {/* Phone Border */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-10"></div>
            
            {/* Screen */}
            <div className="absolute inset-3 bg-white rounded-[2.5rem] overflow-hidden">
              {/* Status Bar */}
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center text-xs border-b border-gray-200">
                <span className="font-semibold text-gray-700">9:41</span>
                <div className="flex gap-1 items-center">
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* App Header */}
              <div className="bg-blue-900 text-white px-6 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">SecureVote</h3>
                    <p className="text-xs text-blue-200">Official Voting App</p>
                  </div>
                </div>
              </div>

              {/* Voting Steps UI */}
              <div className="p-6 space-y-4 bg-gray-50 h-[460px] overflow-y-auto">
                {/* Step 1 */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                      ✓
                    </div>
                    <span className="font-semibold text-gray-900">Identity Verified</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">Your account is secure and ready</p>
                </div>

                {/* Step 2 - Active */}
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-500 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <span className="font-semibold text-blue-900">Select Candidate</span>
                  </div>
                  <div className="ml-11 space-y-2">
                    <div className="bg-white rounded p-3 border border-blue-200 hover:border-blue-400 cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">Candidate A</p>
                          <p className="text-xs text-gray-500">Party Name</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200 hover:border-blue-400 cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">Candidate B</p>
                          <p className="text-xs text-gray-500">Party Name</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 opacity-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">
                      3
                    </div>
                    <span className="font-semibold text-gray-500">Verify Your Vote</span>
                  </div>
                  <p className="text-sm text-gray-400 ml-11">Complete after casting vote</p>
                </div>

                {/* Submit Button */}
                <button className="w-full bg-blue-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition shadow-lg">
                  Submit Vote Securely
                </button>

                {/* Security Notice */}
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-green-800">Your vote is encrypted and anonymous</p>
                </div>
              </div>
            </div>

            {/* Home Button */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full filter blur-2xl opacity-50"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-100 rounded-full filter blur-2xl opacity-50"></div>
        </div>
      </motion.div>
    </div>

    {/* Bottom CTA */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-16 text-center"
    >
      <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-6 py-3 rounded-full">
        <svg className="w-5 h-5 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span className="text-blue-900 font-medium">{t("home.needHelp")}</span>
      </div>
    </motion.div>
  </div>
</section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-20 bg-[#F5F5F5] border-t-2 border-[#E0E0E0]">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
          {t("home.keyFeatures")}
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: t("home.blockchainSecurity"),
              desc: t("home.blockchainSecurityDesc"),
            },
            {
              title: t("home.anonymousVoting"),
              desc: t("home.anonymousVotingDesc"),
            },
            {
              title: t("home.realTimeResults"),
              desc: t("home.realTimeResultsDesc"),
            },
            {
              title: t("home.crossPlatform"),
              desc: t("home.crossPlatformDesc"),
            },
            {
              title: t("home.endToEndEncryption"),
              desc: t("home.endToEndEncryptionDesc"),
            },
            {
              title: t("home.zeroManipulation"),
              desc: t("home.zeroManipulationDesc"),
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-6 bg-white rounded border border-[#E0E0E0] shadow-sm hover:shadow-md transition govt-card"
            >
              <CheckCircle className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-[#002147] py-24 px-6 text-center text-white border-t-4 border-[#FF9933]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-800/90 via-blue-900/90 to-slate-900/95" />
        <div className="absolute inset-x-0 -top-24 h-48 -z-10 opacity-70">
          <svg viewBox="0 0 1440 400" className="h-full w-full text-indigo-900/40" preserveAspectRatio="none">
            <path d="M0,160 C240,280 480,320 720,240 C960,160 1200,0 1440,120 L1440,400 L0,400 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute inset-0 -z-10 opacity-60" style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25) 0, transparent 45%)," +
            "radial-gradient(circle at 80% 30%, rgba(59,130,246,0.2) 0, transparent 50%)," +
            "radial-gradient(circle at 50% 80%, rgba(30,64,175,0.2) 0, transparent 50%)"
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-indigo-100">
            {t("home.secureInclusive")}
          </div>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold leading-tight text-white">
            {t("home.readyToVote")}
          </h2>
          <p className="mt-4 text-lg text-slate-200">
            {t("home.readyToVoteDesc")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 font-semibold text-indigo-700 shadow-xl shadow-indigo-900/60 transition hover:-translate-y-0.5 hover:bg-indigo-100"
          >
            {t("common.beginRegistration")}
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 py-4 font-semibold text-white transition hover:bg-white/20"
          >
            {t("home.reviewProcess")}
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-12 flex items-center justify-center gap-2 text-sm text-indigo-100"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {t("home.nationalPlatform")}
        </motion.p>
      </section>

        <Footer/>
    </div>
  );
}
