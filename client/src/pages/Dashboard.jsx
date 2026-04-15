import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Heatmap from '../components/Heatmap';
import WeeklyPerformance from '../components/WeeklyPerformance';
import SmartPanel from '../components/SmartPanel';
import DisciplineScoreCard from '../components/DisciplineScoreCard';
import ManageTargets from '../components/ManageTargets';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiTarget } from 'react-icons/fi';
import Confetti from 'react-confetti';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [heatmapResponse, setHeatmapResponse] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [disciplineData, setDisciplineData] = useState(null);
  const [streakUpdated, setStreakUpdated] = useState(0);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTodayHabits();
    fetchHeatmap();
    fetchAnalytics();
    fetchDisciplineScore();
  }, []);

  const fetchTodayHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/habits/today?date=${todayStr}`);
      setHabits(res.data.habits || []);
      setCompletionPercentage(res.data.completionPercentage || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    try {
      const res = await api.get('/habits/heatmap');
      setHeatmapResponse(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/monthly');
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Analytics Error:', err);
    }
  };

  const fetchDisciplineScore = async () => {
    try {
      const res = await api.get('/analytics/discipline-score');
      setDisciplineData(res.data);
    } catch (err) {
      console.error('Score Error:', err);
    }
  };


  const toggleHabit = async (habitId) => {
    const updatedHabits = habits.map(h => 
      h.habitId === habitId ? { ...h, completed: !h.completed } : h
    );
    setHabits(updatedHabits);

    try {
      const res = await api.post('/habits/update', {
        date: todayStr,
        habits: updatedHabits
      });
      
      const newPercentage = res.data.dailyHabit.completionPercentage;
      if (newPercentage === 100 && completionPercentage < 100) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      setCompletionPercentage(newPercentage);
      setStreakUpdated(prev => prev + 1);
      fetchHeatmap();
      fetchAnalytics();
      fetchDisciplineScore();
    } catch (err) {
      console.error('Failed to update habit', err);
    }
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-darkBg flex">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} gravity={0.3} />}
      <Sidebar />
      <div className="flex-1 md:ml-72 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <Header streakUpdated={streakUpdated} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Habits List */}
          <div className="lg:col-span-2 glass-panel p-6">
            <div className="flex items-center justify-between mb-8 border-b border-glassBorder pb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiTarget className="text-[#00FF9F]" />
                Today's Targets
              </h3>
              <button 
                onClick={() => setIsManageOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white text-sm transition-all"
              >
                <FiSettings />
                Manage
              </button>
            </div>
            
            <div className="space-y-4 min-h-[200px]">
              {loading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 w-full bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : habits.length === 0 ? (
                <div className="py-20 text-center">
                   <p className="text-white/40 mb-2 font-medium">No targets found</p>
                   <button 
                     onClick={() => setIsManageOpen(true)}
                     className="text-[#00FF9F] text-sm hover:underline"
                   >
                     + Set your first habits to start tracking
                   </button>
                </div>
              ) : (
                <AnimatePresence>
                  {habits.map((habit, index) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      key={habit.habitId} 
                      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-glassBorder"
                      onClick={() => toggleHabit(habit.habitId)}
                    >
                      <label className="relative flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="habit-checkbox peer"
                          checked={habit.completed}
                          readOnly
                        />
                        <div className="absolute inset-0 rounded-md peer-checked:animate-ping opacity-20 pointer-events-none bg-neonGreen"></div>
                      </label>
                      <span className={`text-lg transition-all duration-300 ${habit.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {habit.name}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
          
          {/* Discipline Score & Progress Side-by-Side */}
          <div className="lg:col-span-1 space-y-8">
             <DisciplineScoreCard data={disciplineData} loading={loading} />
             
             <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[300px]">
               <h3 className="text-gray-400 font-medium mb-6 uppercase tracking-widest text-sm">Daily Progress</h3>
               
               <div className="relative w-48 h-48 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle cx="96" cy="96" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
                   <circle 
                     cx="96" cy="96" r="45" fill="none" stroke="#00ff9f" strokeWidth="8" strokeLinecap="round"
                     style={{
                       strokeDasharray: circumference,
                       strokeDashoffset: strokeDashoffset,
                       transition: 'stroke-dashoffset 1s ease-in-out',
                       filter: 'drop-shadow(0 0 8px rgba(0,255,159,0.5))'
                     }}
                   />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black text-white">{completionPercentage}%</span>
                 </div>
               </div>

               <p className="mt-6 text-sm text-gray-400 text-center">
                 {habits.length === 0 ? 'Add habits to see progress' :
                  completionPercentage >= 70 ? '🎉 Streak secured for today!' : 'Reach 70% to continue your streak.'}
               </p>
             </div>
          </div>
        </div>

        {/* Monthly Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="glass-panel p-8">
            <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tighter italic">Weekly Performance</h3>
            {analyticsData && (
              <WeeklyPerformance data={analyticsData.weeklyBreakdown} />
            )}
            {!analyticsData && (
              <div className="h-64 flex items-center justify-center bg-white/5 rounded-3xl animate-pulse text-gray-600">
                Loading Performance...
              </div>
            )}
          </div>
          <div className="glass-panel p-8">
            <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tighter italic">Smart Analysis</h3>
            {analyticsData && (
              <SmartPanel data={analyticsData} />
            )}
             {!analyticsData && (
              <div className="h-64 flex items-center justify-center bg-white/5 rounded-3xl animate-pulse text-gray-600">
                Processing Insights...
              </div>
            )}
          </div>
        </div>

        <Heatmap heatmapResponse={heatmapResponse} />


      <ManageTargets 
        isOpen={isManageOpen} 
        onClose={() => setIsManageOpen(false)} 
        onUpdate={() => {
          fetchTodayHabits();
          fetchHeatmap();
          fetchAnalytics();
          fetchDisciplineScore();
        }}
      />
      </div>
    </div>
  );
};

export default Dashboard;
