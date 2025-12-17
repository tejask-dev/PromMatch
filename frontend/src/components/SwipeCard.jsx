import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Heart, X, MapPin, Calendar } from 'lucide-react';

const SwipeCard = ({ profile, compatibility, onSwipe, style }) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const scale = useTransform(x, [-200, 200], [0.8, 1.2]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const springConfig = { damping: 50, stiffness: 300 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setExitX(direction === 'right' ? 300 : -300);
      onSwipe(direction);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleSwipe = (direction) => {
    setExitX(direction === 'right' ? 300 : -300);
    onSwipe(direction);
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{
        x: xSpring,
        y: ySpring,
        rotate,
        scale,
        opacity,
        ...style,
      }}
      animate={{
        x: exitX,
        opacity: exitX !== 0 ? 0 : 1,
      }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
      }}
      className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Profile Image */}
      <div className="relative h-2/3">
        {profile.profile_pic_url ? (
          <img
            src={profile.profile_pic_url}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
            <div className="text-6xl text-pink-400">👤</div>
          </div>
        )}
        
        {/* Compatibility Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="text-sm font-bold text-gray-900">{compatibility}%</span>
        </div>

        {/* Swipe Indicators */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: x.get() > 50 ? 1 : 0 }}
        >
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="bg-green-500 text-white px-6 py-3 rounded-full text-xl font-bold">
              LIKE
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: x.get() < -50 ? 1 : 0 }}
        >
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <div className="bg-red-500 text-white px-6 py-3 rounded-full text-xl font-bold">
              PASS
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profile Info */}
      <div className="p-6 h-1/3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <span className="text-sm text-gray-500">18</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {profile.bio}
          </p>

          {/* Hobbies */}
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.hobbies.slice(0, 3).map((hobby, index) => (
              <span
                key={index}
                className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs"
              >
                {hobby}
              </span>
            ))}
            {profile.hobbies.length > 3 && (
              <span className="text-xs text-gray-500">
                +{profile.hobbies.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500 hover:bg-green-200 transition-colors"
          >
            <Heart className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
