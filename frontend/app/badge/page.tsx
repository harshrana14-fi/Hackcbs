"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VotingBadge from "@/components/VotingBadge";

function BadgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [voterId, setVoterId] = useState<string | null>(null);

  useEffect(() => {
    // Get voter ID from localStorage
    const id = localStorage.getItem("voterId");
    setVoterId(id);
  }, []);

  const electionTitle = searchParams.get("election") || localStorage.getItem("lastElection") || "";
  const transactionHash = searchParams.get("tx") || localStorage.getItem("transactionHash") || "";

  return (
    <VotingBadge
      voterId={voterId || undefined}
      electionTitle={electionTitle}
      transactionHash={transactionHash}
      onClose={() => router.push("/dashboard")}
    />
  );
}

export default function BadgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading badge...</div>
      </div>
    }>
      <BadgeContent />
    </Suspense>
  );
}

