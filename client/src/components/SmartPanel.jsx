import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Award } from 'lucide-react';

const SmartPanel = ({ data }) => {
  if (!data || !data.insight || data.consistencyScore === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="p-6 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
          <p className="text-gray-500 font-medium">No insights yet — complete habits to unlock</p>
        </div>
      </div>
    );
  }

  const { insight, consistencyMessage, consistencyScore, status } = data;

  return (
    <div className="space-y-6 flex-1">
      {/* Insight Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white/5 rounded-3xl border border-white/10 group hover:border-[#00FF9F]/40 transition-colors"
      >
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-5 h-5 text-[#00FF9F]" />
          <span className="text-[#00FF9F] font-bold uppercase text-[10px] tracking-widest">Insight</span>
        </div>
        <p className="text-white font-bold leading-snug">
          {insight}
        </p>
      </motion.div>

      {/* Consistency Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-white/5 rounded-3xl border border-white/10 group hover:border-[#4F9CFF]/40 transition-colors"
      >
        <div className="flex items-center gap-3 mb-3">
          <Flame className="w-5 h-5 text-[#4F9CFF]" />
          <span className="text-[#4F9CFF] font-bold uppercase text-[10px] tracking-widest">Consistency</span>
        </div>
        <p className="text-white font-bold mb-3">{consistencyMessage}</p>
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${consistencyScore}%` }}
            className={`h-full rounded-full ${consistencyScore >= 70 ? 'bg-[#00FF9F]' : 'bg-[#4F9CFF]'}`}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-white/5 rounded-3xl border border-white/10 group hover:border-white/20 transition-colors"
      >
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-5 h-5 text-purple-400" />
          <span className="text-purple-400 font-bold uppercase text-[10px] tracking-widest">Status</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 ${
            status === 'On Fire' ? 'text-[#00FF9F]' : status === 'Good' ? 'text-[#4F9CFF]' : 'text-orange-400'
          }`}>
            {status}
          </div>
          <span className="text-gray-400 text-xs font-medium italic">Current performance level</span>
        </div>
      </motion.div>
    </div>
  );
};

export default SmartPanel;
