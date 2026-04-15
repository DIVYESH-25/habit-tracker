import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import Confetti from 'react-confetti';
import { Trophy, TrendingUp, Calendar, Zap } from 'lucide-react';

const YearlySummaryPage = () => {
  const [summary, setSummary] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchYearlySummary();
  }, []);

  const fetchYearlySummary = async () => {
    try {
      const res = await api.get('/cycle/yearly-summary');
      setSummary(res.data);
      if (res.data && res.data.averageCompletionRate > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 10000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const { innerWidth: width, innerHeight: height } = window;

  return (
    <div className="min-h-screen bg-darkBg flex relative">
      <Sidebar />
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={800} colors={['#00ff9f', '#4f9cff', '#ffffff', '#fbbf24']} />}
      
      <div className="flex-1 md:ml-72 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl glass-panel p-12 text-center border-t-4 border-t-neonGreen">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-neonGreen/20 to-neonBlue/20 border-2 border-neonGreen flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,255,159,0.3)] animate-bounce-slow">
            <Trophy className="w-12 h-12 text-neonGreen" />
          </div>
          
          <h2 className="text-5xl font-black text-white mb-4 tracking-tight">Yearly Achievement</h2>
          <p className="text-gray-400 text-lg mb-12">Building a lifestyle of discipline, 365 days at a time.</p>

          {!summary || summary.averageCompletionRate === 0 ? (
            <div className="glass-panel p-12 bg-black/30 border-dashed">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-500 font-medium">Your yearly report will be generated automatically after 12 monthly cycles.</p>
              <div className="mt-6 text-sm text-gray-400 px-8 py-3 bg-neonGreen/5 rounded-full inline-block border border-neonGreen/20">
                Consistency is the key to elite performance
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-8 bg-black/40 border-b-2 border-b-neonBlue">
                  <TrendingUp className="w-6 h-6 text-neonBlue mb-3 mx-auto" />
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Annual Avg</div>
                  <div className="text-4xl font-black text-white">{summary.averageCompletionRate}%</div>
                </div>

                <div className="glass-panel p-8 bg-black/40 border-b-2 border-b-neonGreen">
                  <Zap className="w-6 h-6 text-neonGreen mb-3 mx-auto" />
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Best Streak</div>
                  <div className="text-4xl font-black text-white">{summary.bestStreak}</div>
                </div>

                <div className="glass-panel p-8 bg-black/40 border-b-2 border-b-yellow-500">
                  <Calendar className="w-6 h-6 text-yellow-500 mb-3 mx-auto" />
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Total Days</div>
                  <div className="text-4xl font-black text-white">{summary.totalSuccessfulDays}</div>
                </div>

                <div className="glass-panel p-8 bg-black/40 border-b-2 border-b-purple-500">
                  <Trophy className="w-6 h-6 text-purple-500 mb-3 mx-auto" />
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Best Month</div>
                  <div className="text-2xl font-black text-white uppercase">{summary.bestMonth}</div>
                </div>
              </div>

              <div className="p-10 bg-gradient-to-r from-neonGreen/10 to-neonBlue/10 border border-neonGreen/30 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neonGreen to-neonBlue"></div>
                <h4 className="text-2xl font-bold text-white mb-3">You completed a full year of discipline!</h4>
                <p className="text-gray-300">This is not just a report; it's a testament to your character. You are now in the top 1% of achievers who stay the course.</p>
                <div className="mt-6 flex justify-center gap-2">
                   {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-neonGreen animate-pulse"></div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default YearlySummaryPage;
