import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Heart } from 'lucide-react';

const GRADE_LABELS = {
  freshman: 'Freshman', sophomore: 'Sophomore', junior: 'Junior', senior: 'Senior',
};

const SwipeCard = ({ profile, compatibility, onSwipe, style }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [exitX, setExitX] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-28, 28]);
  const opacity = useTransform(x, [-220, -120, 0, 120, 220], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  const xSpring = useSpring(x, { damping: 40, stiffness: 280 });

  const photos = profile.photos?.length
    ? profile.photos.map((p) => p.url)
    : profile.profile_pic_url ? [profile.profile_pic_url] : [];

  const currentPhoto = photos[photoIndex] || null;

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) {
      const dir = info.offset.x > 0 ? 'right' : 'left';
      setExitX(dir === 'right' ? 400 : -400);
      onSwipe(dir);
    } else {
      x.set(0);
    }
  };

  const handleTap = (e) => {
    if (photos.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const zone = rect.width / 3;
    if (tapX < zone) setPhotoIndex((i) => Math.max(0, i - 1));
    else if (tapX > rect.width - zone) setPhotoIndex((i) => Math.min(photos.length - 1, i + 1));
  };

  const compatibilityColor = compatibility >= 80 ? '#22c55e' : compatibility >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      style={{ x: xSpring, rotate, opacity, ...style }}
      animate={{ x: exitX, opacity: exitX !== 0 ? 0 : 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 280 }}
      className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl"
      onClick={handleTap}
    >
      {/* Full-height photo */}
      {currentPhoto ? (
        <img src={currentPhoto} alt={profile.name} className="absolute inset-0 w-full h-full object-cover select-none" draggable={false} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-8xl" style={{ background: 'linear-gradient(135deg, #1a0533, #2d1b69)' }}>👤</div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.92) 100%)' }} />

      {/* Photo dots */}
      {photos.length > 1 && (
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {photos.map((_, i) => (
            <div key={i} className="h-1 rounded-full transition-all duration-200"
              style={{ width: i === photoIndex ? 24 : 8, background: i === photoIndex ? 'white' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
      )}

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
        <div className="glass rounded-full px-3 py-1 text-xs font-semibold text-white">
          {GRADE_LABELS[profile.grade] || profile.grade}
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: `1px solid ${compatibilityColor}60` }}>
          <Heart className="w-3.5 h-3.5" style={{ color: compatibilityColor }} fill={compatibilityColor} />
          <span style={{ color: compatibilityColor }}>{Math.round(compatibility)}%</span>
        </div>
      </div>

      {/* LIKE overlay */}
      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: likeOpacity }}>
        <div className="absolute inset-0" style={{ background: 'rgba(34,197,94,0.15)' }} />
        <div className="border-4 border-green-400 text-green-400 text-4xl font-black px-5 py-2 rounded-xl rotate-[-15deg] tracking-widest"
          style={{ textShadow: '0 0 20px rgba(34,197,94,0.8)' }}>LIKE 💚</div>
      </motion.div>

      {/* PASS overlay */}
      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: passOpacity }}>
        <div className="absolute inset-0" style={{ background: 'rgba(244,63,94,0.15)' }} />
        <div className="border-4 border-red-400 text-red-400 text-4xl font-black px-5 py-2 rounded-xl rotate-[15deg] tracking-widest"
          style={{ textShadow: '0 0 20px rgba(244,63,94,0.8)' }}>PASS 💔</div>
      </motion.div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
        <h2 className="text-3xl font-extrabold text-white mb-1 drop-shadow-lg">{profile.name}</h2>
        {profile.bio && <p className="text-white/75 text-sm mb-3 line-clamp-2 leading-snug">{profile.bio}</p>}
        {profile.hobbies?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.hobbies.slice(0, 4).map((h, i) => (
              <span key={i} className="text-xs text-white/90 font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>{h}</span>
            ))}
            {profile.hobbies.length > 4 && (
              <span className="text-xs text-white/70 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                +{profile.hobbies.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SwipeCard;
