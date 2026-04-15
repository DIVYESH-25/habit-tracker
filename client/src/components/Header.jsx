import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ streakUpdated }) => {
  const { user } = useContext(AuthContext);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await api.get('/streak');
        setStreak(res.data);
      } catch (err) {
        console.error('Failed to fetch streak', err);
      }
    };
    fetchStreak();
  }, [streakUpdated]); // Re-fetch when streakUpdated toggles

  return (
    <header className="flex justify-between items-center bg-transparent py-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Hey, {user?.email?.split('@')[0]} 👋</h2>
        <p className="text-gray-400 text-sm">Stay consistent to reach your goals.</p>
      </div>

      <div className="flex gap-4">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="glass-panel px-6 py-3 flex items-center gap-3"
        >
          <Flame className={`w-6 h-6 ${streak.currentStreak > 0 ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'text-gray-500'}`} />
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Current</div>
            <div className="text-xl font-black text-white">{streak.currentStreak} <span className="text-sm font-normal text-gray-300">{streak.currentStreak === 1 ? 'day' : 'days'}</span></div>
          </div>
        </motion.div>
        
        <div className="glass-panel px-6 py-3 flex items-center gap-3 hidden sm:flex">
          <div className="w-6 h-6 rounded-full bg-neonBlue/20 flex items-center justify-center">
            <span className="text-neonBlue text-xs font-bold">★</span>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Best</div>
            <div className="text-xl font-black text-white">{streak.longestStreak} <span className="text-sm font-normal text-gray-300">{streak.longestStreak === 1 ? 'day' : 'days'}</span></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
