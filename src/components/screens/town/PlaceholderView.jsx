import React from 'react';

const PlaceholderView = ({ title, icon }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-md animate-fade-in text-slate-400">
      <div className="mb-4 p-6 bg-slate-100 rounded-full">{icon}</div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p>この機能は現在準備中です。</p>
    </div>
  );
};

export default PlaceholderView;