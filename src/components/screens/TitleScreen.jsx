import React from 'react';
import { Settings, Play, Users } from 'lucide-react';

const TitleScreen = ({ player, onStartNew, onResume, onDelete, difficulty, setDifficulty, onShowAuth, onMultiplayer }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-800 space-y-8 animate-fade-in relative px-4">
      <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 drop-shadow-md text-center">
        TYPE & SLASH
      </h1>
      <p className="text-slate-500 font-medium">タイピング・ハックアンドスラッシュ</p>
      
      <div className="max-w-2xl bg-white/80 p-6 rounded-lg backdrop-blur-md border border-slate-200 text-sm leading-relaxed text-slate-700 shadow-xl">
        <h3 className="text-yellow-600 font-bold mb-2 text-center text-lg">STORY</h3>
        <p className="mb-2">大陸の辺境で発見された謎の「無限遺跡」。そこは入るたびに構造が変化し、見たこともない財宝と凶悪な魔物がひしめく場所だった。</p>
        <p className="mb-2">この発見により、遺跡の入り口には瞬く間に「始まりの町」が形成され、富と名声を求める者たちが世界中から集まった。</p>
        <p className="mb-2">人間、エルフ、魔族、ドワーフ……種族間の確執を超え、彼らはパーティを組み、遺跡の深淵へと挑む。</p>
        <p className="text-center text-blue-600 mt-2 font-bold">遺跡の奥底には「願いを一つだけ叶える至宝」があるという噂がまことしやかに囁かれている。</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 w-64 shadow-lg">
        <div className="text-center text-sm text-slate-500 mb-2 flex items-center justify-center gap-1">
          <Settings size={14}/> モード設定
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setDifficulty('EASY')}
            className={`flex-1 py-2 rounded text-sm font-bold transition-all ${difficulty === 'EASY' ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            かんたん
            <div className="text-[10px] font-normal">ひらがな</div>
          </button>
          <button 
            onClick={() => setDifficulty('NORMAL')}
            className={`flex-1 py-2 rounded text-sm font-bold transition-all ${difficulty === 'NORMAL' ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            ふつう
            <div className="text-[10px] font-normal">漢字あり</div>
          </button>
        </div>
      </div>

      {!player ? (
        <button 
          onClick={onShowAuth}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-xl font-bold transition-all transform hover:scale-105 text-white shadow-lg"
        >
          冒険を始める
        </button>
      ) : (
        <div className="flex flex-col space-y-4 w-64">
          <button 
            onClick={onResume}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Play size={20}/> 冒険を再開 (Lv.{player.level})
          </button>

          <button 
            onClick={onMultiplayer}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Users size={20}/> 2人対戦 / 観戦
          </button>
          
          <button 
            onClick={onDelete}
            className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-colors"
          >
            データを削除
          </button>
        </div>
      )}
      <div className="text-xs text-slate-400 mt-10">Ver 3.2 (Multiplayer Update)</div>
    </div>
  );
};

export default TitleScreen;