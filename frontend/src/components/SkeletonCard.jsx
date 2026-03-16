import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      {/* Image shimmer - full height */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s linear infinite',
        }}
      />

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="h-7 w-20 rounded-full bg-white/15 animate-pulse" />
        <div className="h-7 w-16 rounded-full bg-white/15 animate-pulse" />
      </div>

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
        <div className="h-7 w-40 bg-white/20 rounded-lg mb-2 animate-pulse" />
        <div className="h-4 w-full bg-white/15 rounded mb-1 animate-pulse" />
        <div className="h-4 w-2/3 bg-white/15 rounded mb-3 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-white/15 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-white/15 rounded-full animate-pulse" />
          <div className="h-6 w-14 bg-white/15 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
