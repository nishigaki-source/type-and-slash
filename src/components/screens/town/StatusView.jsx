import React from 'react';
import { User } from 'lucide-react';
import { RACES, JOBS, RARITY } from '../../../constants/data';
import { calculateEffectiveStats } from '../../../utils/gameLogic';
import ItemIcon from '../../common/ItemIcon';

const StatusView = ({ player, setPlayer, equipped = {}, charGachaData = [] }) => {
  
  // ステータス計算
  const eff = calculateEffectiveStats(player, equipped);
  if (!eff) return null;
  const { base, equip, battle } = eff;

  const getRarityColor = (rarity) => {
    if (!rarity) return 'text-slate-400';
    const key = rarity.toUpperCase();
    return (RARITY[key] || RARITY.N).color;
  };

  const handleSelectCharacter = (char) => {
    setPlayer(prev => ({
      ...prev,
      race: char.race,
      gender: char.gender,
      job: char.job,
      stats: { ...char.stats }
    }));
  };

  const characterImagePath = `/character/${player.race.toLowerCase()}_${player.gender.toLowerCase()}_${player.job.toLowerCase()}.png`;

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in overflow-hidden">
      {/* --- 【固定ヘッダー部分】 --- */}
      <div className="flex-shrink-0 p-6 border-b bg-white/50 shadow-sm z-20">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 border-b pb-2">
          <User /> ステータス詳細
        </h2>
        
        {/* メインセクション：画像・装備・ステータスの3カラムレイアウト */}
        <div className="flex flex-col xl:flex-row gap-4 items-start bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
          
          {/* 1. 左カラム：キャラクター画像と基本情報 */}
          <div className="flex flex-col items-center w-full xl:w-64 space-y-3 flex-shrink-0">
            <div className="w-48 h-48 xl:w-64 xl:h-64 overflow-hidden flex items-center justify-center bg-white rounded-xl shadow-inner border border-slate-200">
               <img 
                 src={characterImagePath} 
                 alt={player.name} 
                 className="w-full h-full object-contain image-pixelated p-4"
               />
            </div>
            <div className="text-center w-full">
               <div className="text-2xl font-black text-slate-900 truncate">{player.name}</div>
               <div className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                 {RACES[player.race]?.name} / {JOBS[player.job]?.name}
               </div>
               <div className="mt-2 flex justify-center gap-2">
                 <span className="bg-slate-800 text-white px-3 py-1 rounded-full font-black text-xs">Lv. {player.level}</span>
               </div>
            </div>
          </div>

          {/* 2. 中央カラム：現在の装備品 */}
          <div className="w-full xl:w-72 flex-shrink-0 space-y-1.5">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Equipped Items</h3>
            {Object.entries(equipped).map(([slot, item]) => (
              <div key={slot} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm h-[52px]">
                <div className="bg-slate-50 p-1.5 rounded flex-shrink-0 border border-slate-100">
                  {item ? (
                    <ItemIcon item={item} size={20} className={getRarityColor(item.rarity)}/>
                  ) : (
                    <div className="w-5 h-5 border-2 border-dashed border-slate-200 rounded-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {item ? (
                    <>
                      <div className={`text-[11px] font-bold truncate ${getRarityColor(item.rarity)}`}>{item.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold flex gap-2">
                        {item.stats.atk > 0 && <span>ATK:{item.stats.atk}</span>}
                        {item.stats.def > 0 && <span>DEF:{item.stats.def}</span>}
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-slate-300 font-bold uppercase italic">Empty {slot}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 3. 右カラム：ステータス詳細 */}
          <div className="flex-1 w-full space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Battle Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[9px] text-slate-400 font-bold mb-1 uppercase">HP</div>
                <div className="text-xl font-mono font-bold text-green-600 leading-none">
                  {battle.maxHp} <span className="text-[10px] font-normal text-slate-300">/ {base.hp}</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[9px] text-slate-400 font-bold mb-1 uppercase">Weight</div>
                <div className={`text-xl font-mono font-bold leading-none ${equip.wt > (base.str + base.vit) ? 'text-red-500' : 'text-slate-700'}`}>
                  {equip.wt}<span className="text-[10px] font-normal text-slate-300">Lmt</span>
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-md text-white">
                <div className="text-[9px] text-slate-400 font-bold mb-1 uppercase">Attack</div>
                <div className="text-xl font-mono font-bold leading-none">{battle.atk}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-md text-white">
                <div className="text-[9px] text-slate-400 font-bold mb-1 uppercase">Defense</div>
                <div className="text-xl font-mono font-bold leading-none">{battle.def}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-5 xl:grid-cols-2 gap-x-6 gap-y-2">
                {['STR', 'VIT', 'DEX', 'AGI', 'LUK'].map(stat => (
                  <div key={stat} className="flex flex-col xl:flex-row xl:justify-between border-b border-slate-50 py-1">
                    <span className="text-[10px] text-slate-400 font-black">{stat}</span>
                    <span className="font-mono font-bold text-sm text-slate-700">{base[stat.toLowerCase()]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 【スクロール可能領域】 --- */}
<div className="flex-1 overflow-y-auto p-6 no-scrollbar">
  <div className="mb-8">
    <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider flex items-center gap-2">
      <span className="w-1.5 h-5 bg-slate-500 rounded-full"></span>
      所持キャラクター大型比較
    </h3>
    
    {/* カードを大きくしたため、1列あたりの数を調整（PCでも2〜3列が見やすいです） */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      {player.characters?.map((char) => {
        const isCurrent = player.job === char.job && player.race === char.race && player.gender === char.gender;
        const imgPath = `/character/${char.race.toLowerCase()}_${char.gender.toLowerCase()}_${char.job.toLowerCase()}.png`;
        
        const latestMaster = charGachaData?.find(m => 
          m.job === char.job && m.race === char.race && m.gender === char.gender
        );
        const rarityKey = latestMaster?.rarity || char.rarity || 'N';

        return (
          <div 
            key={char.id}
            onClick={() => handleSelectCharacter(char)}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] shadow-md flex items-center gap-5 ${
              isCurrent 
                ? 'ring-4 ring-blue-400 border-blue-400 bg-white' 
                : 'border-slate-200 bg-white hover:border-slate-400'
            }`}
          >
            {/* 左側：キャラクター画像 (75%サイズアップ) */}
            <div className="flex flex-col items-center w-28 flex-shrink-0">
              <div className="aspect-square w-28 h-28 overflow-hidden flex items-center justify-center rounded-xl border-2 border-slate-100 bg-slate-50 shadow-inner relative">
                <img 
                  src={imgPath} 
                  alt={char.name} 
                  className="w-full h-full object-contain image-pixelated p-2" 
                />
                <div className="absolute top-0 left-0 text-[10px] font-black px-2 py-0.5 rounded-br-lg border-r-2 border-b-2 border-slate-800 text-slate-800 bg-white/95">
                  {rarityKey}
                </div>
              </div>
              <div className="mt-2 text-center">
                <div className="text-[13px] font-black leading-tight text-slate-800">
                  {JOBS[char.job]?.name}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {RACES[char.race]?.name}
                </div>
              </div>
            </div>

            {/* 右側：詳細ステータス表示 (全体的にフォントサイズを大きく) */}
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 bg-slate-100/50 p-3 rounded-xl border border-slate-100">
              {/* 主要項目 */}
              <div className="col-span-2 flex justify-between items-center border-b-2 border-slate-200 pb-2 mb-1">
                <span className="text-xs font-black text-green-700">HP {char.stats.hp}</span>
                {char.plusCount > 0 && (
                   <span className="text-xs font-black text-white bg-[#1e293b] px-2 py-0.5 rounded-md shadow-sm">+{char.plusCount}</span>
                )}
              </div>
              
              {/* 5大能力値 */}
              {[
                { label: 'STR', val: char.stats.str, color: 'text-red-600' },
                { label: 'VIT', val: char.stats.vit, color: 'text-orange-600' },
                { label: 'DEX', val: char.stats.dex, color: 'text-purple-600' },
                { label: 'AGI', val: char.stats.agi, color: 'text-blue-600' },
                { label: 'LUK', val: char.stats.luk, color: 'text-yellow-700' }
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                  <span className={`text-[10px] font-black ${s.color}`}>{s.label}</span>
                  <span className="text-sm font-mono font-black text-slate-800">{s.val}</span>
                </div>
              ))}
              
              {/* レイアウト調整用のダミー */}
              <div className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                <span className="text-[10px] font-black text-slate-300">---</span>
                <span className="text-sm font-mono font-black text-slate-300">--</span>
              </div>
            </div>

            {/* 選択中バッジ */}
            {isCurrent && (
              <div className="absolute -top-3 -left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg ring-2 ring-white">
                SELECTING
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
</div>
    </div>
  );
};

export default StatusView;