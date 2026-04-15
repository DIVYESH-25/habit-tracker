import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';

const WeeklyPerformance = ({ data }) => {
  if (!data || data.length === 0 || data.every(w => w.score === 0)) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
        <p className="text-gray-500 font-medium">No activity yet — start tracking to unlock analytics</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.week,
    score: item.score
  }));

  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
          barCategoryGap="20%"
        >
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 800 }}
            dy={20}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 12 }}
            contentStyle={{ 
              backgroundColor: '#111827', 
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            itemStyle={{ color: '#fff', fontWeight: '900', fontSize: '14px' }}
            labelStyle={{ display: 'none' }}
          />
          <Bar 
            dataKey="score" 
            radius={[12, 12, 12, 12]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.score >= 70 ? '#00FF9F' : '#4F9CFF'} 
                style={{ 
                  filter: `drop-shadow(0 0 15px ${entry.score >= 70 ? 'rgba(0,255,159,0.5)' : 'rgba(79,156,255,0.5)'})`
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyPerformance;
