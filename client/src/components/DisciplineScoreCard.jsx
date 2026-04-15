import React from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, Zap, Trophy } from 'lucide-react';

const DisciplineScoreCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel p-8 animate-pulse text-center">
        <div className="w-32 h-32 rounded-full border-4 border-white/5 mx-auto mb-6"></div>
        <div className="h-6 w-32 bg-white/5 mx-auto rounded"></div>
      </div>
    );
  }

  if (!data || data.disciplineScore === 0) {
    return (
      <div className="glass-panel p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
        <Target className="w-12 h-12 text-gray-600 mb-4" />
        <h3 className="text-white font-bold text-xl mb-2">Discipline Engine Idle</h3>
        <p className="text-gray-500 max-w-[200px]">Start tracking your habits to generate your Discipline Score.</p>
      </div>
    );
  }

  const { disciplineScore, status, breakdown, insight } = data;
  const circumference = 2 * Math.PI * 54; // r=54
  const strokeDashoffset = circumference - (disciplineScore / 100) * circumference;

  const getStatusColor = (s) => {
    switch (s) {
      case 'Elite': return 'text-[#00FF9F] border-[#00FF9F]/20 bg-[#00FF9F]/5';
      case 'Strong': return 'text-[#4F9CFF] border-[#4F9CFF]/20 bg-[#4F9CFF]/5';
      case 'Growing': return 'text-purple-400 border-purple-400/20 bg-purple-400/5';
      case 'Needs Work': return 'text-orange-400 border-orange-400/20 bg-orange-400/5';
      default: return 'text-red-500 border-red-500/20 bg-red-500/5';
    }
  };

  const getRingColor = (s) => {
    switch (s) {
      case 'Elite': return '#00FF9F';
      case 'Strong': return '#4F9CFF';
      case 'Growing': return '#A855F7';
      case 'Needs Work': return '#FB923C';
      default: return '#EF4444';
    }
  };

  return (
    <div className="glass-panel p-8 relative overflow-hidden group">
      <div className="flex flex-col items-center">
        <h3 className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] mb-8">Discipline Score</h3>
        
        {/* Circular Progress */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
            <motion.circle 
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="80" cy="80" r="54" fill="none" 
              stroke={getRingColor(status)} 
              strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference}
              style={{ filter: `drop-shadow(0 0 15px ${getRingColor(status)}66)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white tracking-tighter">{disciplineScore}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">/ 100</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-6 py-1.5 rounded-full border text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-xl ${getStatusColor(status)}`}>
           {status}
        </div>

        {/* Breakdown Bars */}
        <div className="w-full space-y-5">
           <BreakdownBar label="Consistency" value={breakdown.consistency} icon={<Target className="w-3 h-3" />} color="#00FF9F" />
           <BreakdownBar label="Streak" value={breakdown.streak} icon={<Flame className="w-3 h-3" />} color="#4F9CFF" />
           <BreakdownBar label="Momentum" value={breakdown.momentum} icon={<Zap className="w-3 h-3" />} color="#A855F7" />
        </div>

        {/* Insight Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 w-full">
            <p className="text-gray-400 text-[11px] leading-relaxed text-center font-medium italic">
               "{insight}"
            </p>
        </div>
      </div>
    </div>
  );
};

const BreakdownBar = ({ label, value, icon, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
      <div className="flex items-center gap-2 text-gray-400">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <span className="text-white">{value}%</span>
    </div>
    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}44` }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  </div>
);

export default DisciplineScoreCard;
