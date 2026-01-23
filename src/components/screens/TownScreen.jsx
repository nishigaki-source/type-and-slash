import React, { useState } from 'react';
import { ShoppingBag, Coins, LogOut, User, Scale, Shield, XCircle, Backpack, GraduationCap, Sword } from 'lucide-react';
import { SVGs } from '../GameSvgs';
import { JOBS, ITEM_TYPES, RARITY, CONSUMABLES, RACES } from '../../constants/data';
import { calculateEffectiveStats } from '../../utils/gameLogic';

const TownScreen = ({ player, inventory, equipped, onEquip, onUnequip, onStartBattle, onLogout, onOpenShop, onClassChange, difficulty }) => {
  const [selectedStage, setSelectedStage] = useState(1);
  const JobIll = JOBS[player.job].Illustration;
  
  const eff = calculateEffectiveStats(player, equipped);
  if (!eff) return null;

  const { base, equip, battle } = eff;
  
  return (
    <div className="h-full relative text-slate-800 flex flex-col overflow-hidden bg-slate-50">
      <SVGs.TownBg />
      
      {/* ヘッダー */}
      <div className="bg-white/90 p-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full border-2 border-blue-500 overflow-hidden shadow-sm">
             <JobIll gender={player.gender} race={player.race} />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2 text-slate-800">
                {player.name} 
                <span className="text-xs bg-blue-100 text-blue-800 px-2 rounded font-bold">Lv.{player.level}</span>
            </div>
            <div className="text-xs text-slate-500">{RACES[player.race].name} / {JOBS[player.job].name}</div>
          </div>
          <div className="ml-4 w-32 hidden sm:block">
             <div className="text-xs text-slate-500 flex justify-between">
                <span>EXP</span>
                {(() => {
                  const percent = player.level > 0 ? Math.floor((player.exp / (player.level * 100)) * 100) : 0;
                  return <span>{isNaN(percent) ? 0 : percent}%</span>;
                })()}
             </div>
             <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
               <div className="bg-blue-500 h-full" style={{ width: `${player.level > 0 ? (player.exp / (player.level * 100)) * 100 : 0}%` }}></div>
             </div>
          </div>
        </div>
        <div className="flex gap-4 text-yellow-600 font-bold items-center">
          <div className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">
             {difficulty === 'EASY' ? 'かんたん' : 'ふつう'}
          </div>
          <div className="flex items-center gap-1"><Coins size={16}/> {player.gold} G</div>
          <button onClick={onLogout} className="text-slate-400 hover:text-slate-600"><LogOut size={20}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* 左パネル (ステータス・装備) */}
        <div className="w-1/3 bg-white/85 p-6 overflow-y-auto border-r border-slate-200 backdrop-blur-md">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><User size={18}/> ステータス</h3>
          
          <div className="space-y-4 mb-8">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
               <div className="flex justify-between border-b border-slate-200 pb-1 mb-2">
                 <span className="text-slate-500">HP</span> 
                 <span className="font-mono text-green-600 font-bold">{battle.maxHp}</span>
               </div>
               <div className="flex justify-between border-b border-slate-200 pb-1 mb-2">
                 <span className="text-slate-500">ATK</span> 
                 <span className="font-mono text-red-500 font-bold">{battle.atk}</span>
               </div>
               <div className="flex justify-between border-b border-slate-200 pb-1">
                 <span className="text-slate-500">DEF</span> 
                 <span className="font-mono text-blue-500 font-bold">{battle.def}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span className="text-slate-400">STR (力)</span> <span className="font-mono">{base.str}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">VIT (耐)</span> <span className="font-mono">{base.vit}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">DEX (器)</span> <span className="font-mono">{base.dex}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">AGI (速)</span> <span className="font-mono">{base.agi}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">LUK (運)</span> <span className="font-mono">{base.luk}</span></div>
            </div>

            <div className="bg-slate-50 p-3 rounded text-xs space-y-1 border border-slate-200 text-slate-600">
               <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-slate-400"><Scale size={12}/> 総重量(WT)</span>
                  <span className={`${equip.wt > (base.str + base.vit) ? 'text-red-500 font-bold' : ''}`}>{equip.wt}</span>
               </div>
               <div className="flex justify-between">
                  <span>命中率</span>
                  <span className={`${battle.hitRate < 100 ? 'text-yellow-600 font-bold' : 'text-green-600'}`}>{Math.floor(battle.hitRate)}%</span>
               </div>
               <div className="flex justify-between">
                  <span>回避率</span>
                  <span>{Math.floor(battle.evasionRate)}%</span>
               </div>
               <div className="flex justify-between">
                  <span>クリティカル</span>
                  <span>{Math.floor(battle.critRate)}%</span>
               </div>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><Shield size={18}/> 装備中</h3>
          <div className="space-y-3">
            {Object.keys(equipped).map(slot => (
              <div key={slot} className="bg-slate-50 p-2 rounded border border-slate-200">
                <div className="text-xs text-slate-400 mb-1 flex justify-between">
                  {ITEM_TYPES[slot]}
                  {equipped[slot] && <span className="text-[10px] text-slate-500">WT: {equipped[slot].stats?.wt || 0}</span>}
                </div>
                {equipped[slot] ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`text-sm font-bold ${RARITY[equipped[slot].rarity.toUpperCase()].color}`}>
                        {equipped[slot].name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {(equipped[slot].stats?.atk || 0) > 0 && `ATK:${equipped[slot].stats.atk} `}
                        {(equipped[slot].stats?.def || 0) > 0 && `DEF:${equipped[slot].stats.def} `}
                      </div>
                    </div>
                    <button 
                      onClick={() => onUnequip(slot)}
                      className="ml-2 p-1 text-slate-400 hover:text-red-500"
                      title="外す"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400">装備なし</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右パネル (所持品・アクション) */}
        <div className="w-2/3 p-6 flex flex-col bg-white/80 backdrop-blur-md">
          <div className="flex-1 overflow-y-auto mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><Backpack size={18}/> 所持品</h3>
            {inventory.length === 0 ? (
              <p className="text-slate-400 text-center py-10">アイテムを持っていません</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* 装備品リスト */}
                {inventory.map(item => {
                  if (item.type === 'CONSUMABLE') return null; 
                  const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
                  return (
                    <div key={item.id} className={`bg-white p-3 rounded border flex justify-between items-center group transition-colors shadow-sm ${isEquipped ? 'border-yellow-400 opacity-80' : 'border-slate-200 hover:border-blue-400'}`}>
                      <div>
                        <div className={`text-sm font-bold ${RARITY[item.rarity.toUpperCase()].color}`}>
                          {item.name} {isEquipped && <span className="text-yellow-600 text-[10px] ml-1">[装備中]</span>}
                        </div>
                        <div className="text-xs text-slate-500">
                            {(item.stats?.atk || 0) > 0 && `ATK:${item.stats.atk} `}
                            {(item.stats?.def || 0) > 0 && `DEF:${item.stats.def} `}
                            <span className="text-slate-400 ml-1">WT:{item.stats?.wt || 0}</span>
                        </div>
                      </div>
                      {!isEquipped && (
                        <button 
                          onClick={() => onEquip(item)}
                          className="px-3 py-1 bg-slate-100 text-xs rounded hover:bg-blue-100 hover:text-blue-700 transition-colors font-bold text-slate-600"
                        >
                          装備
                        </button>
                      )}
                      {isEquipped && (
                        <div className="px-3 py-1 text-xs text-yellow-600 font-bold border border-yellow-400 rounded bg-yellow-50">
                           装備中
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* 道具リスト */}
                {inventory.filter(i => i.type === 'CONSUMABLE').map(item => (
                  <div key={item.id} className="bg-white p-3 rounded border border-green-200 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-sm font-bold text-green-600">{item.name}</div>
                      <div className="text-xs text-slate-500">{CONSUMABLES[item.consumableId]?.desc}</div>
                    </div>
                    <div className="text-xs text-slate-400">道具</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* アクションパネル */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-slate-700">ステージ選択</span>
              <select 
                value={selectedStage} 
                onChange={e => setSelectedStage(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
              >
                {[...Array(player.maxStage)].map((_, i) => (
                  <option key={i+1} value={i+1}>ステージ {i+1}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={onOpenShop}
                className="py-4 bg-yellow-500 hover:bg-yellow-400 text-white rounded-lg font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag size={24}/> ショップ
              </button>
              <button 
                onClick={onClassChange}
                className="py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <GraduationCap size={24}/> 転職
              </button>
              <button 
                onClick={() => onStartBattle(selectedStage)}
                className="py-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <Sword size={24}/> 出撃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TownScreen;