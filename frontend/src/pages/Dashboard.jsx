import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Heart, Users, Sparkles, LogOut, ArrowRight, Star, Settings, Trash2, AlertTriangle, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({ total_matches: 0, super_matches: 0 });
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      checkProfile();
      fetchData();
    }
  }, [user]);

  const checkProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/profile/check/${user.id}`);
      if (!response.data.exists) {
        setProfileExists(false);
        navigate('/profile-setup');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/matches/${user.id}`),
        axios.get(`${API_BASE_URL}/stats/${user.id}`)
      ]);
      setMatches(matchesRes.data.matches);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't show error if profile doesn't exist yet
      if (profileExists) {
        toast.error('Error loading data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/users/account/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      
      toast.success('Account deleted successfully');
      
      // Sign out and redirect
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PromMatch</h1>
                <p className="text-xs text-gray-500">Find your perfect date</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/profile-setup')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                title="Delete Account"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-6 text-white mb-6 relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-2">Ready for Prom? 💃🕺</h2>
            <p className="text-white/80 mb-4">Start swiping to find your perfect match!</p>
            <button
              onClick={() => navigate('/swipe')}
              className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center"
            >
              Start Swiping
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 text-center"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total_matches}</p>
            <p className="text-xs text-gray-500">Total Matches</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 text-center"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.super_matches}</p>
            <p className="text-xs text-gray-500">Super Matches</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.regular_matches || 0}</p>
            <p className="text-xs text-gray-500">Regular Matches</p>
          </motion.div>
        </div>

        {/* Matches Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Matches 💕</h2>
            <button
              onClick={fetchData}
              className="text-sm text-pink-500 hover:text-pink-600"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
              <p className="text-gray-500 mb-4">Start swiping to find your prom date!</p>
              <button
                onClick={() => navigate('/swipe')}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90"
              >
                Start Swiping
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {matches.map((match, index) => (
                <motion.div
                  key={match.match_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 flex-shrink-0">
                    {match.other_user?.profile_pic_url ? (
                      <img
                        src={match.other_user.profile_pic_url}
                        alt={match.other_user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900">{match.other_user?.name}</h4>
                      {match.is_super_match && (
                        <Star className="w-4 h-4 text-yellow-500 ml-1" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize">
                      {match.other_user?.grade} • {match.other_user?.gender}
                    </p>
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex space-x-2">
                    {match.other_user?.socials?.instagram && (
                      <a
                        href={`https://instagram.com/${match.other_user.socials.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors text-xs font-medium"
                      >
                        IG
                      </a>
                    )}
                    {match.other_user?.socials?.snapchat && (
                      <a
                        href={`https://snapchat.com/add/${match.other_user.socials.snapchat}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors text-xs font-medium"
                      >
                        SC
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
                </div>
                {!isDeleting && (
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-900 mb-2">What will be deleted:</p>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>Your profile and personal information</li>
                    <li>All your matches</li>
                    <li>All your swipe history</li>
                    <li>Your account credentials</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    disabled={isDeleting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Type DELETE to confirm"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;