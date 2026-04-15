import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-glassBg border border-neonGreen flex items-center justify-center mb-4">
            <Activity className="text-neonGreen w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            30-Day Discipline
          </h2>
          <p className="text-gray-400 mt-2">Build your empire, one day at a time.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm flex justify-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/30 border border-glassBorder rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neonGreen transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/30 border border-glassBorder rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neonGreen transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-neonGreen text-black font-bold text-lg rounded-xl py-3 hover:bg-[#00e68e] transition-colors shadow-[0_0_15px_rgba(0,255,159,0.3)] hover:shadow-[0_0_25px_rgba(0,255,159,0.5)]"
          >
            {isLogin ? 'Enter the Arena' : 'Start Journey'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400">
          {isLogin ? "Don't have an account? " : "Already tracking? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-neonBlue hover:underline focus:outline-none"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
