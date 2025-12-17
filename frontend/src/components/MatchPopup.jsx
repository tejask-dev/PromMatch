import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Instagram, Camera, Star, Sparkles } from 'lucide-react';

const MatchPopup = ({ isOpen, onClose, matchedUser, isSuperMatch = false }) => {
  if (!matchedUser) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background decoration */}
            {isSuperMatch && (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-50 opacity-50"></div>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative">
              {/* Match Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className={`w-24 h-24 ${isSuperMatch ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-pink-500 to-purple-600'} rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg`}>
                  {isSuperMatch ? (
                    <Star className="w-12 h-12 text-white" fill="white" />
                  ) : (
                    <Heart className="w-12 h-12 text-white" fill="white" />
                  )}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {isSuperMatch ? (
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
                      <Sparkles className="w-6 h-6 text-yellow-500" />
                      SUPER MATCH!
                      <Sparkles className="w-6 h-6 text-orange-500" />
                    </h2>
                  ) : (
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
                      It's a Match! 💕
                    </h2>
                  )}
                  <p className="text-gray-600">
                    You and <span className="font-semibold">{matchedUser.name}</span> liked each other!
                  </p>
                </motion.div>
              </motion.div>

              {/* Profile Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-white shadow-lg">
                  {matchedUser.profile_pic_url ? (
                    <img
                      src={matchedUser.profile_pic_url}
                      alt={matchedUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <span className="text-4xl">👤</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{matchedUser.name}</h3>
                <p className="text-sm text-gray-500 capitalize mb-2">
                  {matchedUser.grade} • {matchedUser.gender}
                </p>
                <p className="text-gray-600 text-sm line-clamp-2">{matchedUser.bio}</p>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 mb-6"
              >
                <h4 className="text-sm font-medium text-gray-700">Connect with them:</h4>
                <div className="flex justify-center flex-wrap gap-3">
                  {matchedUser.socials?.instagram && (
                    <a
                      href={`https://instagram.com/${matchedUser.socials.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-4 h-4" />
                      <span className="text-sm font-medium">Instagram</span>
                    </a>
                  )}
                  
                  {matchedUser.socials?.snapchat && (
                    <a
                      href={`https://snapchat.com/add/${matchedUser.socials.snapchat}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-xl hover:bg-yellow-500 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-sm font-medium">Snapchat</span>
                    </a>
                  )}
                  
                  {matchedUser.socials?.tiktok && (
                    <a
                      href={`https://tiktok.com/@${matchedUser.socials.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-sm font-medium">TikTok</span>
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
              >
                Keep Swiping 💫
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchPopup;