import React from 'react';
import { Settings, Play, Users, Gamepad2 } from 'lucide-react';

const TitleScreen = ({ player, onStartNew, onResume, difficulty, setDifficulty, onShowAuth, onMultiplayer, onGuestMultiplayer }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-800 space-y-8 animate-fade-in relative px-4">
      <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 drop-shadow-md text-center">
        TYPE & SLASH
      </h1>
      <p className="text-slate-500 font-medium">タイピング・ハックアンドスラッシュ</p>
      
      <div className="bg-white p-4 rounded-xl border border-slate-200 w-80 shadow-lg">
        <div className="text-center text-sm text-slate-500 mb-2 flex items-center justify-center gap-1">
          <Settings size={14}/> モード設定
        </div>
        <div className="flex gap-2">
          {['EASY', 'NORMAL', 'HARD'].map(d => (
            <button 
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2 rounded text-sm font-bold transition-all ${difficulty === d ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {d === 'EASY' ? 'かんたん' : d === 'NORMAL' ? 'ふつう' : 'むずかしい'}
            </button>
          ))}
        </div>
      </div>

      {!player ? (
        <div className="flex flex-col gap-4 w-72">
          <button 
            onClick={onShowAuth}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-xl font-bold transition-all transform hover:scale-105 text-white shadow-lg"
          >
            冒険を始める
          </button>
          <button 
            onClick={onGuestMultiplayer}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Gamepad2 size={20} /> ゲストで対戦 (ロビー)
          </button>
        </div>
      ) : (
        <div className="flex flex-col space-y-4 w-72">
          <button 
            onClick={onResume}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Play size={20}/> 冒険を再開 (Lv.{player.level})
          </button>

          <button 
            onClick={onMultiplayer} // ロビー画面へ
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Users size={20}/> ロビー (ゲストと対戦)
          </button>
        </div>
      )}
      <div className="text-xs text-slate-400 mt-10">Ver 3.6 (Arena Update)</div>
    </div>
  );
};

export default TitleScreen;