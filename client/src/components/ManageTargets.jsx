import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiTrash2, FiEdit2, FiCheck, FiInfo } from 'react-icons/fi';
import api from '../services/api';

const ManageTargets = ({ isOpen, onClose, onUpdate }) => {
  const [targets, setTargets] = useState([]);
  const [newTargetName, setNewTargetName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTargets();
    }
  }, [isOpen]);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/targets');
      setTargets(res.data);
    } catch (err) {
      console.error('Failed to fetch targets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTargetName.trim()) return;
    
    try {
      setError('');
      const res = await api.post('/targets', { name: newTargetName });
      setTargets([...targets, res.data]);
      setNewTargetName('');
      onUpdate(); // Refresh dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add target');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove from future tracking? (Historical data will be preserved)')) return;
    try {
      await api.delete(`/targets/${id}`);
      setTargets(targets.filter(t => t._id !== id));
      onUpdate();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const startEdit = (target) => {
    setEditingId(target._id);
    setEditName(target.name);
  };

  const saveEdit = async (id) => {
    try {
      const res = await api.put(`/targets/${id}`, { name: editName });
      setTargets(targets.map(t => t._id === id ? res.data : t));
      setEditingId(null);
      onUpdate();
    } catch (err) {
      setError('Failed to update');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0F14]/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-[#161B22] border border-white/10 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00FF9F]/20 flex items-center justify-center">
                  <FiPlus className="text-[#00FF9F] w-5 h-5" />
                </div>
                Manage Targets
              </h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <FiX />
              </button>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3"
              >
                <FiInfo className="flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* ADD FORM */}
            <form onSubmit={handleAdd} className="flex gap-3 mb-8">
              <input 
                type="text"
                placeholder="New target name..."
                value={newTargetName}
                onChange={(e) => setNewTargetName(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF9F]/50 transition-colors"
              />
              <button 
                type="submit"
                className="w-14 h-14 bg-[#00FF9F] hover:bg-[#00FF9F]/90 text-[#0B0F14] rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                disabled={!newTargetName.trim()}
              >
                <FiPlus className="w-6 h-6" />
              </button>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="py-12 text-center text-white/20 animate-pulse">Loading targets...</div>
              ) : targets.length === 0 ? (
                <div className="py-12 text-center">
                   <p className="text-white/40 mb-1">No targets yet</p>
                   <p className="text-white/20 text-xs">Add your first habit above</p>
                </div>
              ) : (
                targets.map(target => (
                  <motion.div 
                    layout
                    key={target._id}
                    className="group flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-all"
                  >
                    {editingId === target._id ? (
                      <div className="flex-1 flex gap-2">
                         <input 
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9F]/50"
                          />
                          <button onClick={() => saveEdit(target._id)} className="p-2 text-[#00FF9F] hover:bg-[#00FF9F]/10 rounded-lg">
                            <FiCheck />
                          </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9F]/40" />
                        <span className="flex-1 text-white/80 font-medium text-sm">{target.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(target)}
                            className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => handleDelete(target._id)}
                             className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            <p className="mt-8 text-center text-xs text-white/20">
              Max 10 active targets allowed.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManageTargets;
