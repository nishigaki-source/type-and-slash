import React, { useState, useMemo } from 'react';
import { Backpack, Shield, XCircle, Sword, Lock, Unlock, ArrowDownUp, Filter, Archive, Coins } from 'lucide-react';
import { ITEM_TYPES, RARITY, CONSUMABLES } from '../../../constants/data';
import { calculateEffectiveStats } from '../../../utils/gameLogic';
import { ItemIcon } from './ItemIcon';

const InventoryView = ({ player, inventory, equipped, onEquip, onUnequip, toggleLock, setPlayer, setInventory }) => {
  // 'EQUIP' | 'ITEM_LIST'
  const [viewMode, setViewMode] = useState('EQUIP');
  
  const [activeTab, setActiveTab] = useState('WEAPON');
  const [sortOrder, setSortOrder] = useState('RARITY_DESC');
  const [previewItem, setPreviewItem] = useState(null); // プレビュー用アイテム

  const getRarityColor = (rarity) => {
    if (!rarity) return RARITY.N.color;
    const key = rarity.toUpperCase();
    return (RARITY[key] || RARITY.N).color;
  };

  // 現在のステータス計算
  const currentStats = useMemo(() => {
    return calculateEffectiveStats(player, equipped);
  }, [player, equipped]);

  // プレビュー時のステータス計算
  const previewStats = useMemo(() => {
    if (!previewItem) return null;
    
    // プレビューアイテムの部位を特定
    let slot = previewItem.type;
    if (slot === 'WEAPON') slot = 'WEAPON'; 
    // 道具は装備しないのでプレビューなし
    if (slot === 'CONSUMABLE') return null;

    // 装備を一時的に差し替えて計算
    const tempEquipped = { ...equipped, [slot]: previewItem };
    return calculateEffectiveStats(player, tempEquipped);
  }, [player, equipped, previewItem]);

  // 差分表示ヘルパー
  const DiffValue = ({ current, preview }) => {
    if (preview === null || preview === undefined || current === preview) return null;
    const diff = preview - current;
    const color = diff > 0 ? 'text-blue-600' : 'text-red-500';
    return <span className={`text-xs font-bold ${color} ml-1`}>({diff > 0 ? '+' : ''}{diff})</span>;
  };

  const TABS = [
    { key: 'WEAPON', label: '武器', icon: <Sword size={14}/> },
    { key: 'HEAD', label: '頭', icon: <Shield size={14}/> },
    { key: 'BODY', label: '体', icon: <Shield size={14}/> },
    { key: 'FEET', label: '足', icon: <Shield size={14}/> },
    { key: 'ACCESSORY', label: '装飾', icon: <Shield size={14}/> },
    { key: 'CONSUMABLE', label: '道具', icon: <Backpack size={14}/> },
  ];

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      if (activeTab === 'CONSUMABLE') return item.type === 'CONSUMABLE';
      return item.type === activeTab;
    });
  }, [inventory, activeTab]);

  const sortedInventory = useMemo(() => {
    const items = [...filteredInventory];
    const rarityOrder = ['n', 'r', 'sr', 'ur', 'lr'];

    return items.sort((a, b) => {
      switch (sortOrder) {
        case 'RARITY_DESC': return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
        case 'STR_DESC': 
          const strA = (a.stats?.atk || 0) + (a.stats?.def || 0);
          const strB = (b.stats?.atk || 0) + (b.stats?.def || 0);
          return strB - strA;
        case 'WEIGHT_ASC': return (a.stats?.wt || 0) - (b.stats?.wt || 0);
        case 'TYPE': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
  }, [filteredInventory, sortOrder]);

  const handleSlotClick = (slotKey) => {
    setActiveTab(slotKey);
    setPreviewItem(null); // タブ切り替えでプレビュー解除
  };

  // アイテムクリック時の処理
  const handleItemClick = (item) => {
    if (viewMode === 'EQUIP') {
      // 装備モード: プレビュー切り替え
      if (item.type === 'CONSUMABLE') return;
      if (previewItem && previewItem.id === item.id) {
        setPreviewItem(null);
      } else {
        setPreviewItem(item);
      }
    } else {
      // アイテム一覧モード: クリック時の挙動（必要なら詳細表示など）
    }
  };

  // 売却処理
  const handleSell = (item) => {
    if (item.locked) {
      alert('ロック中のアイテムは売却できません');
      return;
    }
    const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
    if (isEquipped) {
      alert('装備中のアイテムは売却できません');
      return;
    }

    const sellPrice = Math.floor(item.value / 2);
    if (!window.confirm(`${item.name} を ${sellPrice} G で売却しますか？`)) {
      return;
    }

    setPlayer(prev => ({ ...prev, gold: prev.gold + sellPrice }));
    setInventory(prev => prev.filter(i => i.id !== item.id));
  };

  const EquipSlot = ({ label, slotKey }) => {
    const item = equipped[slotKey];
    const isSelected = activeTab === slotKey;
    
    return (
      <div 
        onClick={() => handleSlotClick(slotKey)}
        className={`relative border-2 rounded-lg p-1 flex flex-col items-center justify-center h-28 cursor-pointer transition-all bg-white
          ${isSelected ? 'border-blue-500 ring-2 ring-blue-100 z-10' : 'border-slate-200 hover:border-slate-400'}
        `}
      >
        <div className="text-[10px] text-slate-400 absolute top-1 left-1 font-bold">{label}</div>
        {item ? (
          <>
            <ItemIcon item={item} size={28} className={getRarityColor(item.rarity)} />
            <div className={`text-[10px] font-bold mt-1 text-center truncate w-full px-1 ${getRarityColor(item.rarity)}`}>{item.name}</div>
            <div className="text-[9px] text-slate-500 leading-tight mt-1">
              {item.stats.atk > 0 && <div>ATK:{item.stats.atk}</div>}
              {item.stats.def > 0 && <div>DEF:{item.stats.def}</div>}
              <div>WT:{item.stats.wt}</div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onUnequip(slotKey); }}
              className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200 shadow-sm z-20"
              title="外す"
            >
              <XCircle size={14} />
            </button>
          </>
        ) : (
          <div className="text-slate-200 text-xl font-bold">+</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex bg-slate-50 animate-fade-in">
      {/* 左サイドメニュー */}
      <div className="w-16 flex-shrink-0 bg-slate-800 flex flex-col items-center py-4 gap-4 shadow-lg z-20">
        <button 
          onClick={() => setViewMode('EQUIP')}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${viewMode === 'EQUIP' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
        >
          <Shield size={20} />
          <span className="text-[9px] font-bold">装備</span>
        </button>
        <button 
          onClick={() => setViewMode('ITEM_LIST')}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${viewMode === 'ITEM_LIST' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
        >
          <Archive size={20} />
          <span className="text-[9px] font-bold">アイテム</span>
        </button>
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 装備モード時のみ表示: ステータス & マネキン */}
        {viewMode === 'EQUIP' && (
          <div className="flex bg-white shadow-sm border-b border-slate-200 shrink-0">
            {/* キャラクターステータス */}
            <div className="w-1/2 p-3 border-r border-slate-100 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                <Shield size={12}/> ステータス
                {previewItem && <span className="text-[10px] text-blue-500 ml-auto animate-pulse">比較中...</span>}
              </h3>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-0.5"><span className="text-slate-400">HP</span> 
                  <span className="font-mono font-bold">{currentStats.battle.maxHp}
                    <DiffValue current={currentStats.battle.maxHp} preview={previewStats?.battle.maxHp} />
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5"><span className="text-slate-400">WT</span> 
                  <span className="font-mono font-bold">{equipped.WEAPON?.stats?.wt || 0}
                  </span>
                </div>

                <div className="flex justify-between col-span-2 pt-1">
                   <span className="text-slate-500 font-bold">ATK</span>
                   <span className="font-mono font-bold text-lg">
                     {currentStats.battle.atk}
                     <DiffValue current={currentStats.battle.atk} preview={previewStats?.battle.atk} />
                   </span>
                </div>
                <div className="flex justify-between col-span-2 border-b border-slate-100 pb-1 mb-1">
                   <span className="text-slate-500 font-bold">DEF</span>
                   <span className="font-mono font-bold text-lg">
                     {currentStats.battle.def}
                     <DiffValue current={currentStats.battle.def} preview={previewStats?.battle.def} />
                   </span>
                </div>

                <div className="flex justify-between"><span className="text-slate-400">DEX</span> <span className="font-mono">{currentStats.battle.dex}<DiffValue current={currentStats.battle.dex} preview={previewStats?.battle.dex} /></span></div>
                <div className="flex justify-between"><span className="text-slate-400">AGI</span> <span className="font-mono">{currentStats.battle.agi}<DiffValue current={currentStats.battle.agi} preview={previewStats?.battle.agi} /></span></div>
                <div className="flex justify-between"><span className="text-slate-400">Hit</span> <span className="font-mono">{currentStats.battle.hitRate}%<DiffValue current={currentStats.battle.hitRate} preview={previewStats?.battle.hitRate} /></span></div>
                <div className="flex justify-between"><span className="text-slate-400">Eva</span> <span className="font-mono">{currentStats.battle.evasionRate}%<DiffValue current={currentStats.battle.evasionRate} preview={previewStats?.battle.evasionRate} /></span></div>
              </div>
            </div>

            {/* マネキン (装備スロット) */}
            <div className="w-1/2 p-2">
              <div className="grid grid-cols-2 gap-2 h-full content-center">
                <EquipSlot label="右手" slotKey="WEAPON" />
                <EquipSlot label="頭" slotKey="HEAD" />
                <EquipSlot label="体" slotKey="BODY" />
                <EquipSlot label="足" slotKey="FEET" />
                <EquipSlot label="装飾" slotKey="ACCESSORY" />
                <div className="border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center opacity-30">
                  <span className="text-[10px]">左手</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 共通: タブ切り替えエリア */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-white no-scrollbar">
          {TABS.map(tab => (
            <button 
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPreviewItem(null); }}
              className={`
                flex-shrink-0 px-3 py-2 font-bold text-xs flex items-center gap-1 border-r border-slate-50 transition-colors whitespace-nowrap
                ${activeTab === tab.key ? 'bg-blue-50 text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-50'}
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* 共通: フィルタ・ソートバー */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter size={12}/> {TABS.find(t => t.key === activeTab)?.label} ({sortedInventory.length})
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownUp size={14} className="text-slate-400"/>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-xs border border-slate-300 rounded p-1 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="RARITY_DESC">レア度順</option>
              <option value="STR_DESC">強い順</option>
              <option value="WEIGHT_ASC">軽い順</option>
              <option value="TYPE">種類順</option>
            </select>
          </div>
        </div>
        
        {/* 共通: アイテムリスト */}
        <div className={`flex-1 overflow-y-auto p-3 ${viewMode === 'ITEM_LIST' ? 'bg-white' : 'bg-slate-100'}`}>
          <div className="grid grid-cols-1 gap-2">
            {sortedInventory.length === 0 && <div className="text-center text-slate-400 py-10">アイテムがありません</div>}
            
            {sortedInventory.map((item, idx) => {
               const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
               const isPreviewing = previewItem && previewItem.id === item.id;
               const canEquip = !item.jobReq || item.jobReq.includes(player.job);
               const isRare = ['sr', 'ur', 'lr'].includes(item.rarity);

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
                      
                      {/* アイテム一覧モードなら売却可能 */}
                      {viewMode === 'ITEM_LIST' ? (
                        <button 
                          onClick={() => handleSell(item)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded font-bold flex items-center gap-1"
                        >
                          <Coins size={12}/> 売却: {Math.floor(item.value / 2)}
                        </button>
                      ) : (
                        <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded">所持</span>
                      )}
                   </div>
                 );
               }

               return (
                 <div 
                   key={`${item.id}-${idx}`} 
                   onClick={() => handleItemClick(item)}
                   className={`
                     relative bg-white p-2 rounded border shadow-sm flex justify-between items-center transition-all cursor-pointer
                     ${isEquipped ? 'border-yellow-400 bg-yellow-50' : ''}
                     ${isPreviewing ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}
                   `}
                 >
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
                      {/* ロックボタン */}
                      {isRare && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleLock(item.id); }} 
                          className={`p-1 rounded ${item.locked ? 'text-red-500' : 'text-slate-300 hover:text-slate-500'}`}
                        >
                          {item.locked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                      )}

                      {/* モードによってアクションボタンを切り替え */}
                      {viewMode === 'EQUIP' ? (
                        // --- 装備モード ---
                        !isEquipped ? (
                          canEquip ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onEquip(item); setPreviewItem(null); }} 
                              className={`text-xs px-3 py-1 rounded font-bold transition-colors border ${isPreviewing ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                            >
                              {isPreviewing ? '決定' : '装備'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-red-500 font-bold border border-red-200 bg-red-50 px-2 py-1 rounded">不可</span>
                          )
                        ) : <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-bold">装備中</span>
                      ) : (
                        // --- アイテム一覧モード (売却) ---
                        <div className="flex items-center gap-1">
                          {isEquipped ? (
                            <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-bold">装備中</span>
                          ) : item.locked ? (
                            <span className="text-[10px] text-red-400 font-bold px-2">ロック中</span>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleSell(item); }}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded font-bold flex items-center gap-1 transition-colors"
                            >
                              <Coins size={12}/> {Math.floor(item.value / 2)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryView;