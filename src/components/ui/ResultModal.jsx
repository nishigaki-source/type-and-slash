// src/components/ui/ResultModal.jsx
import React from 'react';
import { Trophy, Skull, Coins } from 'lucide-react';
import { RARITY } from '../../constants/data';

const ResultModal = ({ message, onClose, onTown }) => {
  if (!message) return null;
  const { type, title, gold, item, levelUpInfo } = message;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`p-8 rounded-2xl border-2 max-w-md w-full text-center shadow-2xl ${type === 'WIN' ? 'bg-white border-yellow-400' : 'bg-white border-red-400'}`}>
        <div className={`mb-4 flex justify-center ${type === 'WIN' ? 'text-yellow-500' : 'text-red-500'}`}>
            {type === 'WIN' ? <Trophy size={48} /> : <Skull size={48} />}
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-wider">{title}</h2>
        
        {type === 'WIN' && (
          <div className="space-y-4 mb-8">
            {levelUpInfo && (
               <div className="bg-green-50 text-green-700 py-3 px-4 rounded font-bold animate-pulse text-left border border-green-200">
                  <div className="text-center text-xl mb-2">LEVEL UP! {levelUpInfo.oldLv} → {levelUpInfo.newLv}</div>
                  <div className="grid grid-cols-2 gap-x-4 text-sm font-mono">
                     {Object.entries(levelUpInfo.gains).map(([key, val]) => (
                        val > 0 && <div key={key} className="flex justify-between">
                           <span>{key.toUpperCase()}</span> 
                           <span>+{val}</span>
                        </div>
                     ))}
                  </div>
               </div>
            )}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500">獲得ゴールド</span>
              <span className="text-yellow-600 font-bold flex items-center gap-1">+{gold} <Coins size={14}/></span>
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 text-left">
              <div className="text-xs text-slate-500 mb-2 text-center">獲得アイテム</div>
              <div className={`text-xl font-bold ${item.type === 'CONSUMABLE' ? 'text-green-600' : RARITY[item.rarity.toUpperCase()].color} mb-2 text-center`}>{item.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  {item.type === 'CONSUMABLE' ? (
                    <div className="col-span-2 text-center">消耗品</div>
                  ) : (
                    <>
                      {(item.stats?.atk || 0) > 0 && <span>ATK:{item.stats.atk}</span>}
                      {(item.stats?.def || 0) > 0 && <span>DEF:{item.stats.def}</span>}
                      <span>WT:{item.stats?.wt || 0}</span>
                    </>
                  )}
              </div>
            </div>
          </div>
        )}

        {type === 'LOSE' && (
          <div className="mb-8 text-slate-500">
              <p>HPが尽きてしまった...</p>
              <p className="text-sm mt-2">装備を見直して再挑戦しよう！</p>
          </div>
        )}

        <button onClick={onTown} className={`w-full py-3 text-white rounded font-bold ${type === 'WIN' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-500 hover:bg-slate-600'}`}>
          町へ戻る
        </button>
      </div>
    </div>
  );
};

export default ResultModal;