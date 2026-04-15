import React from 'react';

const Heatmap = ({ heatmapResponse }) => {
  // heatmapResponse: { month, year, totalDays, data: [...] }
  if (!heatmapResponse) return null;

  const { month, year, totalDays, data } = heatmapResponse;

  const getColor = (percentage) => {
    if (percentage === undefined || percentage === 0) return 'bg-gray-800 border-gray-700';
    if (percentage <= 30) return 'bg-[#1e4d3a] border-[#1e4d3a]';
    if (percentage <= 70) return 'bg-[#00c978] shadow-[0_0_5px_rgba(0,201,120,0.4)]';
    return 'bg-neonGreen shadow-[0_0_10px_rgba(0,255,159,0.6)]';
  };

  return (
    <div className="glass-panel p-6 mt-8">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neonGreen animate-pulse"></span>
        {month} Outlook
      </h3>
      
      <div className="flex flex-wrap gap-2 md:gap-3 justify-start">
        {data.map((item) => {
          const dateObj = new Date(item.date);
          const formattedDate = dateObj.toLocaleDateString('default', { month: 'long', day: 'numeric' });
          
          return (
            <div key={item.date} className="relative group">
              <div 
                className={`w-6 h-6 md:w-8 md:h-8 rounded-[4px] border border-transparent transition-all duration-300 hover:scale-110 cursor-pointer ${getColor(item.completionPercentage)}`}
              ></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-glassBorder shadow-2xl">
                <div className="font-bold border-b border-glassBorder pb-1 mb-1">{formattedDate}</div>
                <div>
                  <span className="text-neonGreen font-bold">{item.completedHabitsCount}/{item.totalHabitsCount || 0}</span> habits completed
                </div>
                <div className="text-[10px] text-gray-500 mt-1">{item.completionPercentage}% achievement</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex items-center gap-4 text-xs text-gray-400">
        <span className="opacity-50 uppercase tracking-tighter font-bold">Consistency</span>
        <div className="flex gap-1.5 items-center">
          <span className="mr-1">Less</span>
          <div className="w-4 h-4 rounded-[3px] bg-gray-800 border border-gray-700"></div>
          <div className="w-4 h-4 rounded-[3px] bg-[#1e4d3a]"></div>
          <div className="w-4 h-4 rounded-[3px] bg-[#00c978]"></div>
          <div className="w-4 h-4 rounded-[3px] bg-neonGreen shadow-[0_0_5px_rgba(0,255,159,0.6)]"></div>
          <span className="ml-1">More</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
