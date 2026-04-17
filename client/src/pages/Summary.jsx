import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, Calendar, Zap, Info, 
  ArrowUpRight, ArrowDownRight, Activity, 
  AlertCircle, Target, Flame, CheckCircle2 
} from 'lucide-react';
import WeeklyPerformance from '../components/WeeklyPerformance';
import SmartPanel from '../components/SmartPanel';

const Summary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get(`/analytics/monthly?t=${Date.now()}`);
      setSummary(res.data);
    } catch (err) {
      console.error('Fetch Summary Error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const circumference = 2 * Math.PI * 40;

  // Stagger animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getColor = (percentage) => {
    if (percentage === null || percentage === undefined || percentage === 0) return 'bg-gray-800 border-gray-700 opacity-30';
    if (percentage < 30) return 'bg-[#1e4d3a] border-[#1e4d3a]';
    if (percentage < 70) return 'bg-[#00c978] shadow-[0_0_10px_rgba(0,201,120,0.4)]';
    return 'bg-[#00FF9F] shadow-[0_0_20px_rgba(0,255,159,0.3)] text-[#0B0F14]';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-[#00FF9F] animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-bold animate-pulse">Analyzing Performance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/5 border border-red-500/30 p-8 text-center max-w-md rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-white text-2xl font-black mb-2 tracking-tight">Sync Failure</h3>
          <p className="text-gray-400 mb-6">We couldn't reach the discipline matrix. Check your uplink.</p>
          <button 
            onClick={fetchSummary}
            className="bg-red-500 text-white font-black px-8 py-3 rounded-2xl hover:bg-red-600 transition-all shadow-lg active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  return (
    <div className="min-h-screen bg-[#0B0F14] flex overflow-x-hidden">
      <Sidebar />
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 md:ml-72 p-4 md:p-10 max-w-7xl mx-auto w-full"
      >
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">
              Monthly <span className="bg-gradient-to-r from-[#00FF9F] to-[#4F9CFF] bg-clip-text text-transparent">Analytics</span>
            </h2>
            <p className="text-gray-400 text-lg font-medium tracking-wide">
              {currentMonthName} Persistence Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
            <Target className="w-5 h-5 text-[#00FF9F]" />
            <span className="text-white font-bold tracking-tight">Day {summary?.currentDay || 0} of {summary?.totalDays || 30}</span>
          </div>
        </header>

        {/* HERO INSIGHT SECTION */}
        <motion.section variants={item} className="mb-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF9F] to-[#4F9CFF] rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative backdrop-blur-2xl bg-black/40 border border-white/10 p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center gap-10 overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-[#00FF9F]/20 to-[#4F9CFF]/20 flex items-center justify-center border-2 border-white/10">
                  <Flame className={`w-12 h-12 md:w-16 md:h-16 ${summary?.currentStreak > 0 ? 'text-[#FF4D4D] animate-pulse' : 'text-gray-500'}`} />
                </div>
                {summary?.currentStreak > 0 && (
                   <div className="absolute -top-3 -right-3 bg-[#FF4D4D] text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                     HOT
                   </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                   <div className="px-4 py-1.5 bg-[#00FF9F]/10 text-[#00FF9F] text-[10px] uppercase font-black rounded-full border border-[#00FF9F]/20 tracking-widest">
                     {summary?.milestone || 'In Progress'}
                   </div>
                   <div className="px-4 py-1.5 bg-[#4F9CFF]/10 text-[#4F9CFF] text-[10px] uppercase font-black rounded-full border border-[#4F9CFF]/20 tracking-widest">
                     Level 5 Focus
                   </div>
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white leading-[1.1] mb-4">
                  {summary?.totalSuccessful > 0 
                    ? (summary?.insight || "Ignite your potential and stay consistent.") 
                    : "Unlocking Discipline Matrix..."}
                </h3>
                <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                  {summary?.totalSuccessful > 0 
                    ? "Building discipline is a muscle. Your daily consistent actions are transforming your character into an elite performer."
                    : "Track your first habit to activate the discipline engine. Your future self is waiting for the analytics to start."}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Card 1: Completion Rate */}
          <motion.div variants={item} className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl group hover:border-[#00FF9F]/40 transition-colors">
            <h4 className="text-gray-500 text-xs uppercase font-black tracking-widest mb-6">Completion Rate</h4>
            <div className="flex items-center justify-center relative mb-6">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <motion.circle 
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - ((summary?.consistencyScore || 0) / 100) * 314 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  cx="64" cy="64" r="50" fill="none" 
                  stroke={ (summary?.consistencyScore || 0) >= 70 ? "#00FF9F" : (summary?.consistencyScore || 0) >= 40 ? "#4F9CFF" : "#FF4D4D"} 
                  strokeWidth="10" strokeLinecap="round" strokeDasharray="314"
                  style={{ filter: `drop-shadow(0 0 10px ${(summary?.consistencyScore || 0) >= 70 ? 'rgba(0,255,159,0.3)' : 'rgba(79,156,255,0.3)'})` }}
                />
              </svg>
              <span className="absolute text-3xl font-black text-white">{summary?.consistencyScore || 0}%</span>
            </div>
            <p className="text-center text-gray-500 text-xs font-semibold">Overall reliability score</p>
          </motion.div>

          {/* Card 2: Consistency Count */}
          <motion.div variants={item} className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl group hover:border-[#4F9CFF]/40 transition-colors flex flex-col items-center justify-center text-center">
            <Calendar className="w-10 h-10 text-[#4F9CFF] mb-6" />
            <h4 className="text-gray-500 text-xs uppercase font-black tracking-widest mb-2">Saved Days</h4>
            <div className="text-5xl font-black text-white tracking-tighter mb-4">
              {summary?.totalSuccessful || 0}<span className="text-xl text-gray-600 font-bold"> / {summary?.currentDay || 0}</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(summary?.totalSuccessful / (summary?.currentDay || 1)) * 100 || 0}%` }}
                 className="h-full bg-[#4F9CFF] rounded-full"
               />
            </div>
          </motion.div>

          {/* Card 3: Best Streak */}
          <motion.div variants={item} className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl group hover:border-[#FF4D4D]/40 transition-colors flex flex-col items-center justify-center text-center">
            <Trophy className={`w-10 h-10 mb-6 ${summary?.currentStreak > 0 ? 'text-[#FF4D4D]' : 'text-gray-600'}`} />
            <h4 className="text-gray-500 text-xs uppercase font-black tracking-widest mb-2">Best Streak</h4>
            <div className="text-5xl font-black text-white tracking-tighter mb-4">
              {summary?.currentStreak || 0}
            </div>
            <div className="text-[10px] text-[#FF4D4D] font-black uppercase tracking-widest px-3 py-1 bg-[#FF4D4D]/10 rounded-full">
              {summary?.currentStreak >= 7 ? 'Legendary' : summary?.currentStreak >= 3 ? 'On Fire' : 'Starting Up'}
            </div>
          </motion.div>

          {/* Card 4: Comparison */}
          <motion.div variants={item} className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl group hover:border-white/20 transition-colors flex flex-col items-center justify-center text-center">
            {summary?.comparison?.startsWith('+') ? (
              <ArrowUpRight className="w-10 h-10 text-[#00FF9F] mb-6" />
            ) : (
              <ArrowDownRight className="w-10 h-10 text-red-500 mb-6" />
            )}
            <h4 className="text-gray-500 text-xs uppercase font-black tracking-widest mb-2">Vs last Month</h4>
            <div className={`text-4xl font-black tracking-tighter mb-2 ${summary?.comparison?.startsWith('+') ? 'text-[#00FF9F]' : 'text-red-500'}`}>
              {summary?.comparison || 'Baseline'}
            </div>
            <p className="text-gray-600 text-[10px] leading-tight max-w-[120px]">Growth performance relative to previous cycle</p>
          </motion.div>
        </div>

        {/* MID SECTION: WEEKLY & TIMELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Weekly Performance */}
          <motion.div variants={item} className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-[40px]">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-[#4F9CFF]" />
                Weekly Performance
              </h3>
              <div className="text-[10px] text-gray-500 font-bold border border-white/10 rounded-full px-4 py-1.5 uppercase tracking-widest">Efficiency Chart</div>
            </div>
            <WeeklyPerformance data={summary?.weeklyBreakdown} />
          </motion.div>

          {/* SMART INSIGHT PANEL */}
          <motion.div variants={item} className="backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-[40px] flex flex-col">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Smart Panel</h3>
            <SmartPanel data={summary} />
            <div className="mt-8 pt-8 border-t border-white/5">
               <p className="text-gray-500 text-xs italic text-center">"Discipline is the bridge between goals and accomplishment."</p>
            </div>
          </motion.div>
        </div>

        {/* STREAK TIMELINE */}
        <motion.section variants={item} className="mb-10 backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-[40px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Activity className="w-6 h-6 text-[#00FF9F]" />
              Month Timeline
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
               <span className="text-gray-500 mr-2">Less</span>
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-sm bg-gray-600" />
                 <div className="w-3 h-3 rounded-sm bg-[#1e4d3a]" />
                 <div className="w-3 h-3 rounded-sm bg-[#00c978]" />
                 <div className="w-3 h-3 rounded-sm bg-[#00FF9F]" />
               </div>
               <span className="text-gray-500 ml-2">More</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {summary?.streakTimeline?.map((percentage, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className={`flex-1 min-w-[30px] h-10 md:h-12 rounded-xl transition-all duration-300 relative group flex items-center justify-center
                  ${getColor(percentage)}
                `}
              >
                 <div className={`text-[10px] font-black transition-opacity ${
                   percentage >= 70 ? 'text-[#0B0F14]' : 'text-gray-400'
                 }`}>
                   {i + 1}
                 </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Hiding telemetry for final premium look */}
      </motion.div>
    </div>
  );
};

export default Summary;
