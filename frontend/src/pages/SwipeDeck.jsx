import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Heart, X, RotateCcw, User, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SwipeCard from '../components/SwipeCard';
import SkeletonCard from '../components/SkeletonCard';
import MatchPopup from '../components/MatchPopup';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000';

const SwipeDeck = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [isSuperMatch, setIsSuperMatch] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/recommendations/${user.id}`);
      setProfiles(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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
      const response = await axios.post(`${API_BASE_URL}/swipe`, {
        user_id: user.id,
        target_user_id: currentProfile.user_id,
        action: action
      });

      if (response.data.match_created) {
        setMatchedUser(currentProfile.profile);
        setIsSuperMatch(response.data.is_super_match);
        setShowMatch(true);
        
        if (response.data.is_super_match) {
          toast.success('💫 SUPER MATCH! 💫', { duration: 3000 });
        } else {
          toast.success('💕 It\'s a Match!', { duration: 3000 });
        }
      }

      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast.error('Error recording swipe. Please try again.');
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMatchClose = () => {
    setShowMatch(false);
    setMatchedUser(null);
    setIsSuperMatch(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Discover</h1>
            <div className="w-10" />
          </div>
          <div className="relative h-[550px]">
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 backdrop-blur-lg rounded-3xl p-8 max-w-sm"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-pink-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {profiles.length === 0 ? 'No Profiles Yet' : 'You\'re All Caught Up!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {profiles.length === 0 
              ? 'Check back later for new students!' 
              : 'Check back later for new matches!'}
          </p>
          <button
            onClick={fetchRecommendations}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
          >
            Refresh
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-32">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Discover</h1>
          <div className="text-sm text-gray-500">
            {currentIndex + 1}/{profiles.length}
          </div>
        </div>

        {/* Swipe Cards */}
        <div className="relative h-[550px]">
          <AnimatePresence>
            {profiles.slice(currentIndex, currentIndex + 2).map((profile, index) => (
              <SwipeCard
                key={profile.user_id}
                profile={profile.profile}
                compatibility={profile.compatibility_percentage}
                onSwipe={handleSwipe}
                isTop={index === 0}
                style={{
                  zIndex: 2 - index,
                  transform: index === 1 ? 'scale(0.95) translateY(20px)' : 'none',
                  opacity: index === 1 ? 0.8 : 1
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-6 mt-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="w-8 h-8" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('super')}
            className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:opacity-90 transition-colors"
          >
            <Star className="w-7 h-7" fill="white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:opacity-90 transition-colors"
          >
            <Heart className="w-8 h-8" fill="white" />
          </motion.button>
        </div>

        {/* Undo Button */}
        {currentIndex > 0 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleUndo}
              className="flex items-center text-gray-500 hover:text-gray-700 text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Undo
            </button>
          </div>
        )}
      </div>

      {/* Match Popup */}
      <MatchPopup
        isOpen={showMatch}
        onClose={handleMatchClose}
        matchedUser={matchedUser}
        isSuperMatch={isSuperMatch}
      />
    </div>
  );
};

export default SwipeDeck;