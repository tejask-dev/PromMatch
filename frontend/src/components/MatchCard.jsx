import React from 'react';
import { motion } from 'framer-motion';
import { Star, Instagram, Camera, Music } from 'lucide-react';

const MatchCard = ({ match, index }) => {
  const user = match.other_user;
  if (!user) return null;

  const score = match.compatibility_score;
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#f43f5e';
  const scoreBg = score >= 80 ? 'rgba(34,197,94,0.15)' : score >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)';

  const GRADE_LABELS = { freshman: 'Freshman', sophomore: 'Sophomore', junior: 'Junior', senior: 'Senior' };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card rounded-2xl p-4 flex items-center gap-4"
    >
      {/* Photo */}
      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2"
        style={{ ringColor: match.is_super_match ? '#f59e0b' : '#ff1a91' }}>
        {user.profile_pic_url ? (
          <img src={user.profile_pic_url} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, #1a0533, #2d1b69)' }}>👤</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-bold text-white truncate">{user.name}</span>
          {match.is_super_match && <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" />}
        </div>
        <p className="text-white/50 text-xs capitalize">
          {GRADE_LABELS[user.grade] || user.grade} · {user.gender}
        </p>
        {user.school && (
          <p className="text-white/35 text-xs truncate mt-0.5">🏫 {user.school}</p>
        )}
      </div>

      {/* Compatibility score */}
      {score != null && (
        <div className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
          style={{ color: scoreColor, background: scoreBg }}>
          {Math.round(score)}% match
        </div>
      )}

      {/* Social links */}
      <div className="flex-shrink-0 flex gap-1.5">
        {user.socials?.instagram && (
          <a href={`https://instagram.com/${user.socials.instagram.replace('@', '')}`}
            target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
            <Instagram className="w-4 h-4 text-white" />
          </a>
        )}
        {user.socials?.snapchat && (
          <a href={`https://snapchat.com/add/${user.socials.snapchat.replace('@', '')}`}
            target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: '#FFFC00' }}>
            <Camera className="w-4 h-4 text-black" />
          </a>
        )}
        {user.socials?.tiktok && (
          <a href={`https://tiktok.com/@${user.socials.tiktok.replace('@', '')}`}
            target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: '#010101' }}>
            <Music className="w-4 h-4 text-white" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default MatchCard;
