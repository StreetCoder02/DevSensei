import { useState, useEffect } from "react";
import { Trophy, Code2, Bug, Brain, MessageSquare, X, Flame } from "lucide-react";

export function ProgressModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [stats, setStats] = useState({
    codingSolved: 0,
    riddlesSolved: 0,
    errorsExplained: 0,
    quizzesAced: 0,
    interviewsCompleted: 0,
    roastsReceived: 0,
  });

  useEffect(() => {
    if (isOpen) {
      const stored = JSON.parse(localStorage.getItem("devsensei_stats") || "{}");
      setStats({
        codingSolved: stored.codingSolved || 0,
        riddlesSolved: stored.riddlesSolved || 0,
        errorsExplained: stored.errorsExplained || 0,
        quizzesAced: stored.quizzesAced || 0,
        interviewsCompleted: stored.interviewsCompleted || 0,
        roastsReceived: stored.roastsReceived || 0,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalInteractions = Object.values(stats).reduce((a, b) => a + b, 0);

  let rank = "Novice";
  let rankColor = "text-zinc-400";
  if (totalInteractions >= 50) { rank = "Sensei"; rankColor = "text-red-500"; }
  else if (totalInteractions >= 20) { rank = "Advanced"; rankColor = "text-orange-400"; }
  else if (totalInteractions >= 5) { rank = "Apprentice"; rankColor = "text-emerald-400"; }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl w-full max-w-md shadow-2xl shadow-red-900/10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#1f1f1f] p-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-red-500" /> Your Dev Portfolio
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-4 mb-6 border border-[#2a2a2a]">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Current Rank</p>
              <p className={`text-xl font-bold ${rankColor}`}>{rank}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total Reps</p>
              <p className="text-xl font-bold text-white">{totalInteractions}</p>
            </div>
          </div>

          <div className="space-y-4">
            <StatRow icon={<Code2 className="w-4 h-4 text-emerald-400" />} label="Coding Challenges" value={stats.codingSolved} />
            <StatRow icon={<Brain className="w-4 h-4 text-purple-400" />} label="Riddles Solved" value={stats.riddlesSolved} />
            <StatRow icon={<Bug className="w-4 h-4 text-amber-400" />} label="Errors Debugged" value={stats.errorsExplained} />
            <StatRow icon={<MessageSquare className="w-4 h-4 text-blue-400" />} label="Mock Interviews" value={stats.interviewsCompleted} />
            <StatRow icon={<Flame className="w-4 h-4 text-orange-500" />} label="Code Roasts" value={stats.roastsReceived} />
          </div>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-zinc-500 italic">Progress is stored securely on your local device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-[#1a1a1a] p-2 rounded-md border border-[#2a2a2a]">{icon}</div>
        <span className="text-sm font-medium text-zinc-300">{label}</span>
      </div>
      <span className="text-base font-bold text-white bg-[#1a1a1a] px-3 py-1 rounded-md border border-[#2a2a2a] min-w-[3rem] text-center">{value}</span>
    </div>
  );
}
