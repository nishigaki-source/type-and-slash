import React from 'react';
import { Sword } from 'lucide-react';

const DungeonView = ({ player, onStartBattle, selectedStage, setSelectedStage }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-sm animate-fade-in p-8">
      <h2 className="text-3xl font-black mb-8 text-red-500 tracking-widest flex items-center gap-4">
        <Sword size={32}/> DUNGEON SELECT
      </h2>
      <div className="bg-slate-900 p-8 rounded-xl border-2 border-slate-700 w-full max-w-md text-center">
        <div className="mb-6">
          <label className="block text-slate-400 mb-2 font-bold">挑戦する階層</label>
          <select 
            value={selectedStage} 
            onChange={e => setSelectedStage(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-600 rounded p-4 text-xl font-bold text-center focus:outline-none focus:border-red-500"
          >
            {[...Array(player.maxStage)].map((_, i) => (
              <option key={i+1} value={i+1}>STAGE {i+1}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-slate-500 mb-8">
           推奨レベル: {selectedStage * 2 - 1} ~ {selectedStage * 2 + 1}
        </div>
        <button 
          onClick={() => onStartBattle(selectedStage)}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-2xl shadow-[0_0_15px_rgba(220,38,38,0.6)] hover:shadow-[0_0_25px_rgba(220,38,38,0.8)] transition-all active:scale-95"
        >
          出撃する
        </button>
      </div>
    </div>
  );
};

export default DungeonView;