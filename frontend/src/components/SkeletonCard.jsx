import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden animate-pulse">
      <div className="h-2/3 bg-gray-200" />
      <div className="p-6 h-1/3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-8 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2" />
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-3" />
          <div className="flex gap-1">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
