import { useRouter } from "next/navigation";

interface ElectionCardProps {
  title: string;
  description: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed";
  totalVotes?: number;
  userVoteStatus?: "voted" | "not-voted" | "not-eligible";
  electionId?: string; // Add electionId prop
}

export default function ElectionCard({ 
  title, 
  description, 
  endDate, 
  status,
  totalVotes,
  userVoteStatus = "not-voted",
  electionId
}: ElectionCardProps) {
  const router = useRouter();

  const getStatusColor = () => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "ongoing": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "upcoming": return "Upcoming";
      case "ongoing": return "Ongoing";
      case "completed": return "Completed";
      default: return "Unknown";
    }
  };

  const getVoteStatusText = () => {
    switch (userVoteStatus) {
      case "voted": return "You have voted";
      case "not-voted": return "You haven't voted";
      case "not-eligible": return "Not eligible";
      default: return "";
    }
  };

  const getVoteStatusColor = () => {
    switch (userVoteStatus) {
      case "voted": return "text-green-600";
      case "not-voted": return "text-yellow-600";
      case "not-eligible": return "text-gray-500";
      default: return "text-gray-500";
    }
  };

  const handleVoteClick = () => {
    // Navigate to the voting page
    router.push("/dashboard/vote");
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-500">Ends</p>
            <p className="font-medium">{endDate}</p>
          </div>
          
          {totalVotes !== undefined && (
            <div>
              <p className="text-gray-500">Votes</p>
              <p className="font-medium">{totalVotes.toLocaleString()}</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className={`text-sm ${getVoteStatusColor()}`}>
            {getVoteStatusText()}
          </span>
          
          {status === "ongoing" && userVoteStatus === "not-voted" && (
            <button 
              onClick={handleVoteClick}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              Vote Now
            </button>
          )}
          
          {status === "upcoming" && (
            <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed" disabled>
              Register
            </button>
          )}
          
          {status === "completed" && (
            <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed" disabled>
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}