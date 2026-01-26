import React from 'react';
import { SVGs } from '../../GameSvgs';

const HomeView = () => {
  return (
    <div className="h-full w-full relative">
       <div className="absolute inset-0 -z-10">
         <SVGs.TownBg />
       </div>
       <div className="absolute bottom-4 left-4 bg-white/80 p-3 rounded-lg backdrop-blur-sm border border-white/50">
          <p className="text-slate-800 font-bold text-sm">ようこそ、始まりの町へ。</p>
          <p className="text-slate-600 text-xs">右のメニューから行動を選択してください。</p>
       </div>
    </div>
  );
};

export default HomeView;