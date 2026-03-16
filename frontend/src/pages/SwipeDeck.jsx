import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Heart, X, RotateCcw, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SwipeCard from '../components/SwipeCard';
import SkeletonCard from '../components/SkeletonCard';
import MatchPopup from '../components/MatchPopup';
import toast from 'react-hot-toast';
import { API_BASE_URL, getAuthHeaders } from '../config/api';

const SwipeDeck = () => {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [isSuperMatch, setIsSuperMatch] = useState(false);
  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [compatibilityStrengths, setCompatibilityStrengths] = useState([]);

  useEffect(() => {
    if (user) fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = token ? getAuthHeaders(token) : {};
      const res = await axios.get(`${API_BASE_URL}/recommendations`, { headers });
      setProfiles(res.data.recommendations || []);
      setCurrentIndex(0);
    } catch (e) {
      toast.error('Error loading profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= profiles.length) return;
    const currentProfile = profiles[currentIndex];
    const action = direction === 'right' ? 'yes' : direction === 'super' ? 'super' : 'no';

    try {
      const token = getToken();
      const headers = token ? getAuthHeaders(token) : {};
      const res = await axios.post(`${API_BASE_URL}/swipe`, {
        target_user_id: currentProfile.user_id,
        action,
      }, { headers });

      if (res.data.match_created) {
        setMatchedUser(currentProfile.profile);
        setIsSuperMatch(res.data.is_super_match);
        setCompatibilityScore(res.data.compatibility_score);
        setCompatibilityStrengths(res.data.compatibility_details?.strengths || []);
        setShowMatch(true);
        if (res.data.is_super_match) toast.success('💫 SUPER MATCH!', { duration: 3000 });
        else toast.success("💕 It's a Match!", { duration: 3000 });
      }
      setCurrentIndex((i) => i + 1);
    } catch (e) {
      toast.error('Error recording swipe.');
    }
  };

  const handleMatchClose = () => {
    setShowMatch(false);
    setMatchedUser(null);
    setIsSuperMatch(false);
    setCompatibilityScore(null);
    setCompatibilityStrengths([]);
  };

  const currentProfile = profiles[currentIndex];
  const progress = profiles.length > 0 ? (currentIndex / profiles.length) * 100 : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-prom text-xl gradient-text">Discover</span>
            <div className="w-9" />
          </div>
          <div className="relative h-[540px]"><SkeletonCard /></div>
        </div>
      </div>
    );
  }

  // Empty state
  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">{profiles.length === 0 ? '🌙' : '✨'}</div>
          <h2 className="text-2xl font-black text-white mb-2">
            {profiles.length === 0 ? 'No Profiles Yet' : "You're All Caught Up!"}
          </h2>
          <p className="text-white/50 text-sm mb-6">
            {profiles.length === 0 ? 'Check back later for new students!' : 'Check back later for new matches!'}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={fetchRecommendations} className="btn-prom py-3 text-sm">Refresh</button>
            <button onClick={() => navigate('/dashboard')} className="btn-glass py-3 text-sm rounded-xl">Back to Matches</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-prom text-xl gradient-text">Discover</span>
          <div className="w-9" />
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #ff1a91, #7c3aed)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Card stack */}
        <div className="relative h-[540px]">
          <AnimatePresence>
            {profiles.slice(currentIndex, currentIndex + 2).map((p, i) => (
              <SwipeCard
                key={p.user_id}
                profile={p.profile}
                compatibility={p.compatibility_percentage}
                onSwipe={handleSwipe}
                style={{
                  zIndex: 2 - i,
                  transform: i === 1 ? 'scale(0.94) translateY(18px)' : 'none',
                  opacity: i === 1 ? 0.75 : 1,
                  pointerEvents: i === 0 ? 'auto' : 'none',
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-5 mt-7">
          {/* Pass */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(244,63,94,0.15)', border: '2px solid rgba(244,63,94,0.4)' }}
          >
            <X className="w-8 h-8 text-red-400" />
          </motion.button>

          {/* Super Like (center, elevated) */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('super')}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 0 30px rgba(245,158,11,0.5)' }}
          >
            <Star className="w-9 h-9 text-white" fill="white" />
          </motion.button>

          {/* Like */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #ff1a91, #7c3aed)', boxShadow: '0 0 25px rgba(255,26,145,0.4)' }}
          >
            <Heart className="w-8 h-8 text-white" fill="white" />
          </motion.button>
        </div>

        {/* Undo */}
        {currentIndex > 0 && (
          <div className="flex justify-center mt-4">
            <button onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Undo
            </button>
          </div>
        )}
      </div>

      <MatchPopup
        isOpen={showMatch}
        onClose={handleMatchClose}
        matchedUser={matchedUser}
        isSuperMatch={isSuperMatch}
        compatibilityScore={compatibilityScore}
        compatibilityStrengths={compatibilityStrengths}
      />
    </div>
  );
};

export default SwipeDeck;
