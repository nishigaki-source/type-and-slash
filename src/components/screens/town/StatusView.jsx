import React from 'react';
import { User, PenTool } from 'lucide-react';
import { JOBS, RACES, RARITY } from '../../../constants/data';
import { calculateEffectiveStats } from '../../../utils/gameLogic';
import ItemIcon from '../../common/ItemIcon'; // 画像対応版のItemIconを使用

const StatusView = ({ player, equipped, onClassChange }) => {
  // アイコンには profileJob があればそれを使用し、なければ実際の職業(job)を使用する
  const displayJobId = player.profileJob || player.job;
  const JobIll = JOBS[displayJobId]?.Illustration || JOBS[player.job].Illustration;
  
  const eff = calculateEffectiveStats(player, equipped);
  if (!eff) return null;
  const { base, equip, battle } = eff;

  const getRarityColor = (rarity) => {
    if (!rarity) return RARITY.N.color;
    const key = rarity.toUpperCase();
    return (RARITY[key] || RARITY.N).color;
  };

  return (
    <div className="h-full p-6 overflow-y-auto bg-white/90 backdrop-blur-md animate-fade-in no-scrollbar">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 border-b pb-2">
        <User /> ステータス詳細
      </h2>
      
      <div className="flex gap-6 mb-6">
        {/* アイコン画像のみ profileJob を反映 */}
        <div className="w-32 h-32 bg-slate-100 rounded-full border-4 border-blue-500 overflow-hidden shadow-lg flex-shrink-0">
           <JobIll gender={player.gender} race={player.race} />
        </div>
        
        <div className="flex-1 space-y-2">
           <div className="text-xl font-bold text-slate-800">{player.name}</div>
           {/* テキスト情報は常に本来の種族(race)と職業(job)を表示 */}
           <div className="text-slate-600 font-medium">
             {RACES[player.race]?.name} / {JOBS[player.job]?.name}
           </div>
           <div className="flex gap-2 mt-2">
              <button 
                onClick={onClassChange} 
                className="bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-purple-500 flex items-center gap-1 transition-colors shadow-sm"
              >
                 <PenTool size={12}/> 転職・訓練
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
           <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">HP</div>
           <div className="text-2xl font-mono font-bold text-green-600">
             {battle.maxHp} <span className="text-sm font-normal text-slate-400">(+{battle.maxHp - base.hp})</span>
           </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
           <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">総重量</div>
           <div className={`text-2xl font-mono font-bold ${equip.wt > (base.str + base.vit) ? 'text-red-500' : 'text-slate-700'}`}>
             {equip.wt} <span className="text-sm font-normal text-slate-400">/ {base.str + base.vit}</span>
           </div>
        </div>
      </div>

      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 mb-6 shadow-sm">
         <div className="flex justify-between items-end border-b border-slate-200 pb-2">
            <span className="text-sm text-slate-500 font-bold">ATK (攻撃力)</span>
            <span className="font-mono font-bold text-xl text-slate-800">{battle.atk} <span className="text-slate-400 text-xs">(+{equip.atk})</span></span>
         </div>
         <div className="flex justify-between items-end border-b border-slate-200 pb-2">
            <span className="text-sm text-slate-500 font-bold">DEF (防御力)</span>
            <span className="font-mono font-bold text-xl text-slate-800">{battle.def} <span className="text-slate-400 text-xs">(+{equip.def})</span></span>
         </div>
         <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm pt-2">
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-400 font-bold">STR</span> <span className="font-mono font-bold">{base.str}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-400 font-bold">VIT</span> <span className="font-mono font-bold">{base.vit}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-400 font-bold">DEX</span> <span className="font-mono font-bold">{base.dex}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-400 font-bold">AGI</span> <span className="font-mono font-bold">{base.agi}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-400 font-bold">LUK</span> <span className="font-mono font-bold">{base.luk}</span></div>
         </div>
      </div>

      <h3 className="text-sm font-bold text-slate-500 mb-3 border-l-4 border-blue-500 pl-2">現在の装備</h3>
      <div className="space-y-2 mb-8">
        {Object.entries(equipped).map(([slot, item]) => item ? (
          <div key={slot} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-blue-300">
             <div className="bg-slate-100 p-2 rounded flex-shrink-0">
               <ItemIcon item={item} size={24} className={getRarityColor(item.rarity)}/>
             </div>
             <div className="flex-1 min-w-0">
               <div className={`text-sm font-bold truncate ${getRarityColor(item.rarity)}`}>{item.name}</div>
               <div className="text-[10px] text-slate-400 font-bold flex gap-2 mt-0.5">
                 {item.stats.atk > 0 && <span>ATK:{item.stats.atk}</span>}
                 {item.stats.def > 0 && <span>DEF:{item.stats.def}</span>}
                 <span>WT:{item.stats.wt}</span>
               </div>
             </div>
             <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{slot}</div>
          </div>
        ) : null)}
        {Object.values(equipped).every(v => !v) && (
          <div className="text-slate-400 text-center py-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-sm">装備はありません</div>
        )}
      </div>
    </div>
  );
};

export default StatusView;