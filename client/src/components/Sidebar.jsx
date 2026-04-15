import React from 'react';
import { LogOut, Home, Award, Calendar } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Monthly Rep', path: '/summary' },
    { icon: Award, label: 'Annual Rep', path: '/yearly' }
  ];

  return (
    <aside className="w-64 glass-panel h-[calc(100vh-2rem)] flex flex-col fixed left-4 top-4 hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-glassBg border border-neonGreen flex items-center justify-center">
          <Calendar className="text-neonGreen w-5 h-5" />
        </div>
        <h1 className="font-bold text-lg text-white">30-Day Track</h1>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                ? 'bg-neonGreen/10 text-neonGreen shadow-[inset_4px_0_0_0_#00ff9f]' 
                : 'text-gray-400 hover:bg-glassBg hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-glassBorder mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
