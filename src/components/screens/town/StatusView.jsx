import React from 'react';
import { User, PenTool } from 'lucide-react';
import { JOBS, RACES, RARITY } from '../../../constants/data';
import { calculateEffectiveStats } from '../../../utils/gameLogic';
import { ItemIcon } from './ItemIcon';

const StatusView = ({ player, equipped, onClassChange }) => {
  const JobIll = JOBS[player.job].Illustration;
  const eff = calculateEffectiveStats(player, equipped);
  if (!eff) return null;
  const { base, equip, battle } = eff;

  const getRarityColor = (rarity) => {
    if (!rarity) return RARITY.N.color;
    const key = rarity.toUpperCase();
    return (RARITY[key] || RARITY.N).color;
  };

  return (
    <div className="h-full p-6 overflow-y-auto bg-white/90 backdrop-blur-md animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 border-b pb-2">
        <User /> ステータス詳細
      </h2>
      <div className="flex gap-6 mb-6">
        <div className="w-32 h-32 bg-slate-100 rounded-full border-4 border-blue-500 overflow-hidden shadow-lg flex-shrink-0">
           <JobIll gender={player.gender} race={player.race} />
        </div>
        <div className="flex-1 space-y-2">
           <div className="text-xl font-bold">{player.name}</div>
           <div className="text-slate-600">{RACES[player.race].name} / {JOBS[player.job].name}</div>
           <div className="flex gap-2 mt-2">
              <button onClick={onClassChange} className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-purple-500 flex items-center gap-1">
                 <PenTool size={12}/> 転職・訓練
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded border border-slate-200">
           <div className="text-sm text-slate-500 mb-1">HP</div>
           <div className="text-2xl font-mono font-bold text-green-600">
             {battle.maxHp} <span className="text-sm font-normal text-slate-400">(+{battle.maxHp - base.hp})</span>
           </div>
        </div>
        <div className="bg-slate-50 p-4 rounded border border-slate-200">
           <div className="text-sm text-slate-500 mb-1">総重量</div>
           <div className={`text-2xl font-mono font-bold ${equip.wt > (base.str + base.vit) ? 'text-red-500' : 'text-slate-700'}`}>
             {equip.wt} <span className="text-sm font-normal text-slate-400">/ {base.str + base.vit}</span>
           </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3 mb-6">
         <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">ATK (攻撃力)</span>
            <span className="font-mono font-bold">{battle.atk} <span className="text-slate-400 text-xs">(+{equip.atk})</span></span>
         </div>
         <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">DEF (防御力)</span>
            <span className="font-mono font-bold">{battle.def} <span className="text-slate-400 text-xs">(+{equip.def})</span></span>
         </div>
         <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
            <div className="flex justify-between"><span className="text-slate-400">STR</span> <span className="font-mono">{base.str}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">VIT</span> <span className="font-mono">{base.vit}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">DEX</span> <span className="font-mono">{base.dex}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">AGI</span> <span className="font-mono">{base.agi}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">LUK</span> <span className="font-mono">{base.luk}</span></div>
         </div>
      </div>

      <h3 className="text-sm font-bold text-slate-500 mb-3 border-b pb-1">装備中</h3>
      <div className="space-y-2">
        {Object.values(equipped).map((item, i) => item ? (
          <div key={i} className="flex items-center gap-3 bg-white p-2 rounded border border-slate-200 shadow-sm">
             <div className="bg-slate-100 p-2 rounded"><ItemIcon item={item} size={20} className={getRarityColor(item.rarity)}/></div>
             <div>
               <div className={`text-sm font-bold ${getRarityColor(item.rarity)}`}>{item.name}</div>
               <div className="text-[10px] text-slate-500">
                 {item.stats.atk > 0 && `ATK:${item.stats.atk} `}{item.stats.def > 0 && `DEF:${item.stats.def} `}WT:{item.stats.wt}
               </div>
             </div>
          </div>
        ) : null)}
        {Object.values(equipped).every(v => !v) && <div className="text-slate-400 text-sm">装備なし</div>}
      </div>
    </div>
  );
};

export default StatusView;