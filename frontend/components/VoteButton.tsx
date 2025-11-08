interface VoteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  hasVoted?: boolean;
}

export default function VoteButton({ 
  onClick, 
  disabled = false, 
  hasVoted = false 
}: VoteButtonProps) {
  if (hasVoted) {
    return (
      <button 
        disabled 
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed"
      >
        Voted ✓
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-medium transition ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      }`}
    >
      Vote
    </button>
  );
}