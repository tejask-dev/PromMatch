import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Heart, Sparkles, LogOut, ArrowRight, Star, Settings, Trash2, AlertTriangle, X, Zap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getAuthHeaders } from '../config/api';
import MatchCard from '../components/MatchCard';

const AnimatedStat = ({ value, label, icon, delay }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let v = 0;
    const step = Math.max(1, Math.ceil(value / 20));
    const t = setInterval(() => {
      v += step;
      if (v >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(v);
    }, 40);
    return () => clearInterval(t);
  }, [value]);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay || 0 }} className="glass-card rounded-2xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-3xl font-black text-white">{display}</p>
      <p className="text-white/50 text-xs mt-0.5">{label}</p>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user, signOut, getToken } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({ total_matches: 0, super_matches: 0, regular_matches: 0 });
  const [loading, setLoading] = useState(true);
  const [hasAnswers, setHasAnswers] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) { checkProfile(); fetchData(); }
  }, [user]);

  const checkProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/profile/check/${user.id}`);
      if (!res.data.exists) navigate('/profile-setup');
    } catch (e) {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = token ? getAuthHeaders(token) : {};
      const [matchesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/matches`, { headers }),
        axios.get(`${API_BASE_URL}/stats`, { headers }),
      ]);
      setMatches(matchesRes.data.matches || []);
      setStats(statsRes.data);
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/users/profile/${user.id}`);
        const qa = profileRes.data?.profile?.question_answers || {};
        setHasAnswers(Object.keys(qa).length > 3);
      } catch (e) {}
    } catch (e) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); }
    catch (e) { toast.error('Error signing out'); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') { toast.error('Type "DELETE" to confirm'); return; }
    setIsDeleting(true);
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/users/account/${user.id}`, { headers: getAuthHeaders(token) });
      toast.success('Account deleted');
      await signOut();
      navigate('/');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const initials = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen pb-12">
      {/* Nav */}
      <div className="glass sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, #ff1a91, #7c3aed)' }}>
              {initials}
            </div>
            <span className="font-prom text-xl gradient-text">PromMatch</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/questionnaire')} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all" title="Vibe Check">
              <Sparkles className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/profile-setup')} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all" title="Edit Profile">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={handleSignOut} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #ff1a91 0%, #7c3aed 60%, #1a0533 100%)' }}>
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -left-4 bottom-0 text-6xl opacity-10 select-none">💕</div>
          <div className="relative">
            <p className="text-white/70 text-sm mb-1">Ready to find your prom date?</p>
            <h2 className="text-2xl font-black text-white mb-4">Let's Find Your Match ✨</h2>
            <button onClick={() => navigate('/swipe')}
              className="flex items-center gap-2 bg-white text-purple-700 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm">
              Start Swiping <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Questionnaire CTA */}
        {!hasAnswers && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => navigate('/questionnaire')}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ff1a91, #7c3aed)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">Boost Your Matches 🚀</p>
              <p className="text-white/50 text-xs">Answer a few questions for smarter recommendations</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <AnimatedStat value={stats.total_matches} label="Total Matches" icon="💕" delay={0.1} />
          <AnimatedStat value={stats.super_matches} label="Super Matches" icon="⭐" delay={0.2} />
          <AnimatedStat value={stats.regular_matches} label="Regular" icon="✨" delay={0.3} />
        </div>

        {/* Matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white text-lg">Your Matches 💕</h2>
            <button onClick={fetchData} className="text-xs text-white/40 hover:text-white/70 transition-colors">Refresh</button>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-pink-500 animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 text-center">
              <div className="text-5xl mb-3">💭</div>
              <h3 className="font-bold text-white mb-1">No matches yet</h3>
              <p className="text-white/40 text-sm mb-4">Start swiping to find your prom date!</p>
              <button onClick={() => navigate('/swipe')} className="btn-prom px-6 py-2.5 text-sm">Start Swiping</button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {matches.map((match, i) => <MatchCard key={match.match_id} match={match} index={i} />)}
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
            onClick={() => !isDeleting && setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-3xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.2)' }}>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="font-bold text-white">Delete Account</h3>
                </div>
                {!isDeleting && <button onClick={() => setShowDeleteModal(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>}
              </div>
              <p className="text-white/60 text-sm mb-4">This will permanently delete all your data, matches, and swipes.</p>
              <div className="mb-4">
                <label className="block text-white/50 text-xs mb-1.5">Type <span className="text-red-400 font-bold">DELETE</span> to confirm:</label>
                <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
                  disabled={isDeleting} className="input-dark text-sm" placeholder="DELETE" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                  disabled={isDeleting} className="flex-1 btn-glass py-2.5 text-sm rounded-xl">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                  {isDeleting ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Deleting…</> : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
