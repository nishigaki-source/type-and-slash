import React, { useState } from 'react';
import { Backpack, Shield, XCircle, Sword, Lock, Unlock } from 'lucide-react';
import { ITEM_TYPES, RARITY, CONSUMABLES } from '../../../constants/data';
import { ItemIcon } from './ItemIcon';

const InventoryView = ({ player, inventory, equipped, onEquip, onUnequip, toggleLock }) => {
  const [tab, setTab] = useState('EQUIPMENT');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const getRarityColor = (rarity) => {
    if (!rarity) return RARITY.N.color;
    const key = rarity.toUpperCase();
    return (RARITY[key] || RARITY.N).color;
  };

  const filteredInventory = inventory.filter(item => {
    if (tab === 'EQUIPMENT') return item.type !== 'CONSUMABLE';
    return item.type === 'CONSUMABLE';
  });

  // 部位ごとのアイテム選択モード
  const handleSlotClick = (slotKey) => {
    // 既に選択中なら解除、そうでなければ選択
    if (selectedSlot === slotKey) setSelectedSlot(null);
    else setSelectedSlot(slotKey);
  };

  // 選択中のスロットに装備可能なアイテムのみ表示
  const displayedInventory = selectedSlot 
    ? filteredInventory.filter(item => {
        if (item.type === 'WEAPON') return selectedSlot === 'WEAPON';
        return item.type === selectedSlot;
      })
    : filteredInventory;

  const EquipSlot = ({ label, slotKey }) => {
    const item = equipped[slotKey];
    const isSelected = selectedSlot === slotKey;
    
    return (
      <div 
        onClick={() => handleSlotClick(slotKey)}
        className={`relative border-2 rounded-lg p-2 flex flex-col items-center justify-center h-24 cursor-pointer transition-all
          ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md scale-105 z-10' : 'border-slate-200 bg-slate-50 hover:border-slate-400'}
        `}
      >
        <div className="text-[10px] text-slate-400 absolute top-1 left-2 font-bold">{label}</div>
        {item ? (
          <>
            <ItemIcon item={item} size={32} className={getRarityColor(item.rarity)} />
            <div className={`text-xs font-bold mt-1 text-center truncate w-full px-1 ${getRarityColor(item.rarity)}`}>{item.name}</div>
            <button 
              onClick={(e) => { e.stopPropagation(); onUnequip(slotKey); }}
              className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200 shadow-sm z-20"
              title="外す"
            >
              <XCircle size={14} />
            </button>
          </>
        ) : (
          <div className="text-slate-300 text-2xl font-bold opacity-30">+</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in">
      {/* 装備セクション (マネキン) */}
      <div className="p-4 bg-white shadow-sm border-b border-slate-200 flex-shrink-0 z-10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2"><Shield size={16}/> 装備 (部位を選択して変更)</h3>
          {selectedSlot && <button onClick={() => setSelectedSlot(null)} className="text-xs text-blue-500 underline">選択解除</button>}
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          <EquipSlot label="頭" slotKey="HEAD" />
          <div className="flex items-center justify-center opacity-20"><UserIcon /></div> 
          <EquipSlot label="アクセサリー" slotKey="ACCESSORY" />
          
          <EquipSlot label="右手 (武器)" slotKey="WEAPON" />
          <EquipSlot label="胴体" slotKey="BODY" />
          <div className="bg-slate-100 border-2 border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center opacity-40">
             <span className="text-[10px] text-slate-400 font-bold">左手</span>
             <Shield size={20} className="text-slate-300 mt-1"/>
          </div>

          <div className="invisible"></div>
          <EquipSlot label="足" slotKey="FEET" />
          <div className="invisible"></div>
        </div>
      </div>

      {/* タブ切り替え */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button 
          onClick={() => { setTab('EQUIPMENT'); setSelectedSlot(null); }}
          className={`flex-1 py-2 font-bold text-xs flex items-center justify-center gap-2 ${tab === 'EQUIPMENT' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Sword size={14}/> 武具
        </button>
        <button 
          onClick={() => { setTab('CONSUMABLE'); setSelectedSlot(null); }}
          className={`flex-1 py-2 font-bold text-xs flex items-center justify-center gap-2 ${tab === 'CONSUMABLE' ? 'bg-white text-green-600 border-t-2 border-green-600' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Backpack size={14}/> 道具
        </button>
      </div>
      
      {/* アイテムリスト */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        {selectedSlot && <div className="text-xs text-blue-600 font-bold mb-2 text-center">▼ {ITEM_TYPES[selectedSlot]} を選択中</div>}
        
        <div className="grid grid-cols-1 gap-2">
          {displayedInventory.length === 0 && <div className="text-center text-slate-400 py-10">アイテムがありません</div>}
          
          {displayedInventory.map((item, idx) => {
             const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
             
             // 消耗品
             if (item.type === 'CONSUMABLE') {
               const data = CONSUMABLES[item.consumableId] || {};
               return (
                 <div key={`${item.id}-${idx}`} className="bg-white p-2 rounded border border-green-200 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 p-2 rounded"><ItemIcon item={item} size={20} className="text-green-600" /></div>
                      <div>
                        <div className="text-sm font-bold text-green-700">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{data.desc}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded">所持</span>
                 </div>
               );
             }

             // 装備品
             const canEquip = !item.jobReq || item.jobReq.includes(player.job);
             // SR以上ならロック機能を表示
             const isRare = ['sr', 'ur', 'lr'].includes(item.rarity);

             return (
               // ★修正: keyにidxを追加して一意性を保証
               <div key={`${item.id}-${idx}`} className={`bg-white p-2 rounded border shadow-sm flex justify-between items-center ${isEquipped ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-slate-100 p-2 rounded flex-shrink-0"><ItemIcon item={item} size={20} className={getRarityColor(item.rarity)} /></div>
                    <div className="min-w-0">
                      <div className={`text-sm font-bold truncate ${getRarityColor(item.rarity)}`}>
                        {item.name} {item.uniqueCode && <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded ml-1">{item.uniqueCode}</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 flex gap-1">
                        {item.stats.atk > 0 && <span>ATK:{item.stats.atk}</span>}
                        {item.stats.def > 0 && <span>DEF:{item.stats.def}</span>}
                        <span>WT:{item.stats.wt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* ロックボタン (SR以上のみ) */}
                    {isRare && (
                      <button onClick={() => toggleLock(item.id)} className={`p-1 rounded ${item.locked ? 'text-red-500' : 'text-slate-300 hover:text-slate-500'}`}>
                        {item.locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                    )}

                    {!isEquipped ? (
                      canEquip ? (
                        <button onClick={() => onEquip(item)} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1 rounded font-bold transition-colors">装備</button>
                      ) : (
                        <span className="text-[10px] text-red-500 font-bold border border-red-200 bg-red-50 px-2 py-1 rounded">不可</span>
                      )
                    ) : <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-bold">装備中</span>}
                  </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

// 簡易マネキンアイコン
const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default InventoryView;