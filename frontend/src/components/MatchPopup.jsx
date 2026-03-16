import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Instagram, Camera, Music, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MatchPopup = ({ isOpen, onClose, matchedUser, isSuperMatch, compatibilityScore, compatibilityStrengths }) => {
  const navigate = useNavigate();
  const isSuper = isSuperMatch || false;

  useEffect(() => {
    if (!isOpen) return;
    let t;
    const launch = async () => {
      try {
        const confetti = (await import('canvas-confetti')).default;
        const colors = isSuper ? ['#fbbf24','#f59e0b','#ffffff'] : ['#ff1a91','#7c3aed','#ffffff'];
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors, zIndex: 9999 });
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors, zIndex: 9999 });
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors, zIndex: 9999 });
      } catch (e) { /* confetti unavailable */ }
    };
    t = setTimeout(launch, 200);
    return () => clearTimeout(t);
  }, [isOpen, isSuper]);

  if (!matchedUser) return null;
  const ig = matchedUser.socials?.instagram;
  const sc = matchedUser.socials?.snapchat;
  const tt = matchedUser.socials?.tiktok;
  const borderColor = isSuper ? '#f59e0b' : '#ff1a91';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="glass-card rounded-3xl p-7 max-w-sm w-full text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: isSuper
                ? 'radial-gradient(circle at 50% 20%, rgba(245,158,11,0.25) 0%, transparent 70%)'
                : 'radial-gradient(circle at 50% 20%, rgba(255,26,145,0.25) 0%, transparent 70%)'
            }} />

            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors z-10">
              <X className="w-4 h-4" />
            </button>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 shadow-xl"
              style={{ background: isSuper ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #ff1a91, #7c3aed)' }}>
              {isSuper ? <Star className="w-10 h-10 text-white" fill="white" /> : <Heart className="w-10 h-10 text-white" fill="white" />}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {isSuper ? (
                <h2 className="text-2xl font-black mb-1 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="gradient-text-gold">SUPER MATCH!</span>
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </h2>
              ) : (
                <h2 className="text-2xl font-black gradient-text mb-1">It's a Match! 💕</h2>
              )}
              <p className="text-white/60 text-sm mb-4">
                You and <span className="text-white font-semibold">{matchedUser.name}</span> liked each other!
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="mb-5">
              <div className="w-24 h-24 rounded-full mx-auto overflow-hidden shadow-xl" style={{ border: `3px solid ${borderColor}` }}>
                {matchedUser.profile_pic_url
                  ? <img src={matchedUser.profile_pic_url} alt={matchedUser.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: 'linear-gradient(135deg, #1a0533, #2d1b69)' }}>👤</div>
                }
              </div>
              <h3 className="text-lg font-bold text-white mt-2">{matchedUser.name}</h3>
              <p className="text-white/50 text-xs capitalize mt-0.5">{matchedUser.grade} · {matchedUser.gender}</p>
              {compatibilityScore != null && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'rgba(255,26,145,0.15)', color: '#ff80be' }}>
                  <Heart className="w-3.5 h-3.5" fill="currentColor" />
                  {Math.round(compatibilityScore)}% compatibility
                </div>
              )}
              {compatibilityStrengths && compatibilityStrengths.length > 0 && (
                <p className="text-white/40 text-xs mt-1.5">✨ {compatibilityStrengths.slice(0, 2).join(' · ')}</p>
              )}
            </motion.div>

            {(ig || sc || tt) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2 mb-5">
                <p className="text-white/40 text-xs font-medium">Connect with {matchedUser.name}</p>
                <div className="flex flex-col gap-2">
                  {ig && (
                    <a href={'https://instagram.com/' + ig.replace('@', '')} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white hover:opacity-85 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
                      <Instagram className="w-4 h-4" /> Instagram
                    </a>
                  )}
                  {sc && (
                    <a href={'https://snapchat.com/add/' + sc.replace('@', '')} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold hover:opacity-85 transition-opacity"
                      style={{ background: '#FFFC00', color: '#000' }}>
                      <Camera className="w-4 h-4" /> Snapchat
                    </a>
                  )}
                  {tt && (
                    <a href={'https://tiktok.com/@' + tt.replace('@', '')} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white hover:opacity-85 transition-opacity"
                      style={{ background: '#010101' }}>
                      <Music className="w-4 h-4" /> TikTok
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 btn-glass py-2.5 rounded-xl text-sm font-semibold">Keep Swiping</button>
              <button onClick={() => { onClose(); navigate('/dashboard'); }} className="flex-1 btn-prom py-2.5 rounded-xl text-sm">View Matches</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchPopup;
