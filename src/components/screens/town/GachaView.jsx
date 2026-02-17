import React, { useState } from 'react';
import { Gift, Coins, Sparkles, UserPlus, Loader2 } from 'lucide-react';
// generateId を追加
import { generateItem, generateId } from '../../../utils/gameLogic';
import { ItemIcon } from './ItemIcon';
import { RARITY } from '../../../constants/data';

const GachaView = ({ player, setPlayer, setInventory, charGachaData = [] }) => {
  const [activeTab, setActiveTab] = useState('EQUIP'); // 'EQUIP' or 'CHAR'
  const [result, setResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const GACHA_COST = 100;

  const handleEquipGacha = () => {
    const newItem = generateItem(player.level, null, null, true);
    setInventory(prev => [...prev, newItem]);
    setResult({ type: 'ITEM', data: newItem });
  };

  const handleCharGacha = () => {
    // データのロードチェック
    if (!charGachaData || charGachaData.length === 0) {
      alert('キャラクターデータを読み込み中です。しばらくお待ちください。');
      return null;
    }
    
    const rand = Math.random();
    let cumulative = 0;
    let selectedChar = charGachaData[charGachaData.length - 1];

    for (const char of charGachaData) {
      const chance = parseFloat(char.chance) || 0;
      cumulative += chance;
      if (rand < cumulative) {
        selectedChar = char;
        break;
      }
    }

    const newCharObj = {
      id: generateId(),
      name: selectedChar.name,
      job: selectedChar.job,
      race: selectedChar.race,
      gender: selectedChar.gender,
      stats: { ...selectedChar.stats },
      imageId: selectedChar.imageId // 画像IDも保持
    };

    // 結果をセット（表示用）
    setResult({ type: 'CHAR', data: selectedChar }); 

    return newCharObj;
  };

  const handleGacha = () => {
    if (player.gold < GACHA_COST) {
      alert('ゴールドが足りません！');
      return;
    }
    setIsAnimating(true);
    setResult(null);

    setTimeout(() => {
      const nextGold = player.gold - GACHA_COST;

      if (activeTab === 'EQUIP') {
        handleEquipGacha();
        setPlayer(prev => ({ ...prev, gold: nextGold }));
      } else {
        // --- キャラクターガチャ抽選 ---
        const rand = Math.random();
        let cumulative = 0;
        let selectedChar = charGachaData[charGachaData.length - 1];

        for (const char of charGachaData) {
          const chance = parseFloat(char.chance) || 0;
          cumulative += chance;
          if (rand < cumulative) {
            selectedChar = char;
            break;
          }
        }

        setResult({ type: 'CHAR', data: selectedChar });

        setPlayer(prev => {
          const currentChars = prev.characters || [];
          // 同一キャラの判定（名前・職業・種族・性別が一致するか）
          const existingIndex = currentChars.findIndex(c => 
            c.name === selectedChar.name && 
            c.job === selectedChar.job && 
            c.race === selectedChar.race && 
            c.gender === selectedChar.gender
          );

          let updatedCharacters;
          if (existingIndex > -1) {
            // --- マージ処理 ---
            updatedCharacters = [...currentChars];
            const target = { ...updatedCharacters[existingIndex] };
            
            // マージ回数（plusCount）を増やす
            target.plusCount = (target.plusCount || 0) + 1;
            
            // 全ステータスを+1（基礎ステータスを直接強化）
            const newStats = { ...target.stats };
            Object.keys(newStats).forEach(key => {
              newStats[key] += 1;
            });
            target.stats = newStats;

            updatedCharacters[existingIndex] = target;
          } else {
            // --- 新規追加 ---
            const newCharObj = {
              id: generateId(),
              name: selectedChar.name,
              job: selectedChar.job,
              race: selectedChar.race,
              gender: selectedChar.gender,
              stats: { ...selectedChar.stats },
              imageId: selectedChar.imageId,
              plusCount: 0 // 初期値は0
            };
            updatedCharacters = [...currentChars, newCharObj];
          }

          return {
            ...prev,
            gold: nextGold,
            characters: updatedCharacters
          };
        });
      }
      setIsAnimating(false);
    }, 1000);
  }; 

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in relative">
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => { if(!isAnimating) { setActiveTab('EQUIP'); setResult(null); } }}
          className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'EQUIP' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-500' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Gift size={18}/> 装備ガチャ
        </button>
        <button 
          onClick={() => { if(!isAnimating) { setActiveTab('CHAR'); setResult(null); } }}
          className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'CHAR' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <UserPlus size={18}/> キャラガチャ
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        
        {/* ガチャ演出エリア */}
        <div className="relative">
          <div className={`transition-all duration-500 ${isAnimating ? 'animate-bounce scale-110' : ''}`}>
             {activeTab === 'EQUIP' 
               ? <Gift size={120} className={isAnimating ? "text-purple-600" : "text-slate-400"} />
               : <UserPlus size={120} className={isAnimating ? "text-blue-600" : "text-slate-400"} />
             }
          </div>
          {isAnimating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="animate-spin text-yellow-400" size={160} />
            </div>
          )}
        </div>

        {/* 結果表示 */}
        {result && !isAnimating && (
          <div className="bg-white p-6 rounded-xl shadow-2xl border-4 border-yellow-400 flex flex-col items-center animate-fade-in w-full max-w-sm z-10">
            <h3 className="text-lg font-black text-yellow-600 mb-2">
              {result.type === 'ITEM' ? 'GET ITEM!' : 'NEW CHARACTER!'}
            </h3>
            
            {result.type === 'ITEM' ? (
              <div className="mb-4 transform scale-150 py-4">
                <ItemIcon item={result.data} size={32} className={RARITY[result.data.rarity.toUpperCase()]?.color} />
              </div>
            ) : (
              <div className="w-32 h-32 mb-4 bg-slate-50 rounded-full border-2 border-blue-100 overflow-hidden">
                <img 
                  src={`/character/${result.data.imageId}`} 
                  alt={result.data.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = '/character/fallback.png'; }} 
                />
              </div>
            )}

            <div className={`text-xl font-bold mb-1 ${result.type === 'ITEM' ? RARITY[result.data.rarity.toUpperCase()]?.color : 'text-blue-700'}`}>
            {result.data.name}
            {/* キャラクターかつ重複マージだった場合に +X を表示 */}
            {result.type === 'CHAR' && (() => {
              const charInInventory = player.characters?.find(c => 
                c.name === result.data.name && c.job === result.data.job
              );
              return charInInventory?.plusCount > 0 ? ` +${charInInventory.plusCount}` : '';
            })()}
          </div>

            <button 
              onClick={() => setResult(null)} 
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors"
            >
              閉じる
            </button>
          </div>
        )}

        {/* 操作ボタン */}
        {!result && !isAnimating && (
          <div className="text-center space-y-4">
            <p className="text-slate-500 font-bold">1回 100G で{activeTab === 'EQUIP' ? '装備品' : '新しい姿'}をゲット！</p>
            <button 
              onClick={handleGacha}
              disabled={player.gold < GACHA_COST || (activeTab === 'CHAR' && charGachaData.length === 0)}
              className={`
                px-8 py-4 rounded-full font-black text-xl shadow-lg flex items-center gap-2 transition-all active:scale-95
                ${(player.gold >= GACHA_COST) 
                  ? (activeTab === 'EQUIP' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600') + ' text-white hover:scale-105' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
              `}
            >
              {activeTab === 'CHAR' && charGachaData.length === 0 ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {activeTab === 'EQUIP' ? '装備' : 'キャラ'}ガチャを回す
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GachaView;