import React, { useState } from 'react';
import { Gift, Coins, Sparkles } from 'lucide-react';
import { generateItem } from '../../../utils/gameLogic';
import { ItemIcon } from './ItemIcon';
import { RARITY } from '../../../constants/data';

const GachaView = ({ player, setPlayer, setInventory }) => {
  const [resultItem, setResultItem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const GACHA_COST = 100;

  const handleGacha = () => {
    if (player.gold < GACHA_COST) {
      alert('ゴールドが足りません！');
      return;
    }

    setIsAnimating(true);
    setResultItem(null);

    // 演出用タイマー
    setTimeout(() => {
      // 100G消費
      setPlayer(prev => ({ ...prev, gold: prev.gold - GACHA_COST }));

      // アイテム生成 (ランク指定なし, 職業指定なし, 装備品確定フラグ=true)
      const newItem = generateItem(player.level, null, null, true);
      
      setInventory(prev => [...prev, newItem]);
      setResultItem(newItem);
      setIsAnimating(false);
    }, 1000); // 1秒後に結果表示
  };

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in relative">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Gift className="text-purple-500" /> 装備ガチャ
        </h2>
        <div className="text-yellow-600 font-bold flex items-center gap-1">
          <Coins size={16}/> {player.gold.toLocaleString()} G
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        
        {/* ガチャ演出エリア */}
        <div className="relative">
          <div className={`transition-all duration-500 ${isAnimating ? 'animate-bounce scale-110' : ''}`}>
             <Gift size={120} className={isAnimating ? "text-purple-600" : "text-slate-400"} />
          </div>
          {isAnimating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="animate-spin text-yellow-400" size={160} />
            </div>
          )}
        </div>

        {/* 結果表示 */}
        {resultItem && !isAnimating && (
          <div className="bg-white p-6 rounded-xl shadow-xl border-4 border-yellow-400 flex flex-col items-center animate-fade-in w-full max-w-sm">
            <h3 className="text-lg font-black text-yellow-600 mb-2">GET ITEM!</h3>
            <div className="mb-4 transform scale-150">
               <ItemIcon item={resultItem} size={32} className={RARITY[resultItem.rarity.toUpperCase()].color} />
            </div>
            <div className={`text-xl font-bold ${RARITY[resultItem.rarity.toUpperCase()].color} mb-2`}>
              {resultItem.name}
            </div>
            <div className="text-sm text-slate-500 mb-4 grid grid-cols-2 gap-x-4">
               {resultItem.stats.atk > 0 && <span>攻撃力: {resultItem.stats.atk}</span>}
               {resultItem.stats.def > 0 && <span>防御力: {resultItem.stats.def}</span>}
               <span>重さ: {resultItem.stats.wt}</span>
               <span>レア: {resultItem.rarity.toUpperCase()}</span>
            </div>
            <button 
              onClick={() => setResultItem(null)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-full font-bold text-sm"
            >
              閉じる
            </button>
          </div>
        )}

        {/* 操作ボタン */}
        {!resultItem && !isAnimating && (
          <div className="text-center space-y-4">
            <p className="text-slate-500 font-bold">1回 100G で装備品をゲット！</p>
            <button 
              onClick={handleGacha}
              disabled={player.gold < GACHA_COST}
              className={`
                px-8 py-4 rounded-full font-black text-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95
                ${player.gold >= GACHA_COST 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
              `}
            >
              <Sparkles /> ガチャを回す
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GachaView;