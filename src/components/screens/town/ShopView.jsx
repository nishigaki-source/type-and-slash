import React, { useState } from 'react';
import { ShoppingBag, Lock } from 'lucide-react';
import { RARITY, CONSUMABLES } from '../../../constants/data';
import { ItemIcon } from './ItemIcon';

const ShopView = ({ 
  player, inventory, equipped, 
  shopItems = [], setShopItems, setPlayer, setInventory 
}) => {
  const [shopTab, setShopTab] = useState('BUY'); 

  const getRarityColor = (rarity) => {
    if (!rarity) return RARITY.N.color;
    const key = rarity.toUpperCase();
    return (RARITY[key] || RARITY.N).color;
  };

  const handleBuy = (item) => {
    if (!setPlayer || !setInventory || !setShopItems) return;
    if (player.gold < item.value) {
      alert('ゴールドが足りません！');
      return;
    }
    setPlayer(prev => ({ ...prev, gold: prev.gold - item.value }));
    setInventory(prev => [...prev, item]);
    setShopItems(prev => prev.filter(i => i.id !== item.id));
  };

  const handleSell = (item) => {
    if (!setPlayer || !setInventory) return;
    
    // ロックチェック
    if (item.locked) {
      alert('このアイテムはロックされています。売却するにはロックを解除してください。');
      return;
    }

    const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
    if (isEquipped) {
      alert('装備中のアイテムは売却できません！');
      return;
    }
    const sellPrice = Math.floor(item.value / 2);
    setPlayer(prev => ({ ...prev, gold: prev.gold + sellPrice }));
    setInventory(prev => prev.filter(i => i.id !== item.id));
  };

  const currentShopItems = Array.isArray(shopItems) ? shopItems : [];
  const categorizedItems = { WEAPON: [], HEAD: [], BODY: [], FEET: [], ACCESSORY: [], CONSUMABLE: [] };

  currentShopItems.forEach(item => {
    let typeKey = item.type;
    if (item.type === 'CONSUMABLE') typeKey = 'CONSUMABLE';
    else if (item.type === 'WEAPON') typeKey = 'WEAPON';
    if (categorizedItems[typeKey]) categorizedItems[typeKey].push(item);
  });

  const categoryNames = { WEAPON: '武器', HEAD: '頭防具', BODY: '身体防具', FEET: '足防具', ACCESSORY: '装飾品', CONSUMABLE: '道具' };

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <ShoppingBag /> ショップ
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setShopTab('BUY')} className={`px-4 py-1 rounded text-sm font-bold transition-colors ${shopTab === 'BUY' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>購入</button>
          <button onClick={() => setShopTab('SELL')} className={`px-4 py-1 rounded text-sm font-bold transition-colors ${shopTab === 'SELL' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'}`}>売却</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {shopTab === 'BUY' ? (
          <div className="space-y-6">
            {currentShopItems.length === 0 && <div className="text-center text-slate-400 py-10">商品が入荷待ちです</div>}
            {Object.keys(categorizedItems).map(key => {
              if (categorizedItems[key].length === 0) return null;
              return (
                <div key={key}>
                  <h3 className="text-sm font-bold text-slate-500 mb-2 border-b border-slate-200 pb-1">{categoryNames[key]}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {categorizedItems[key].map(item => {
                      const canEquip = !item.jobReq || item.jobReq.includes(player.job);
                      return (
                        <div key={item.id} className="bg-white p-2 rounded border border-slate-200 flex justify-between items-center shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-50 p-2 rounded"><ItemIcon item={item} size={20} className={item.type==='CONSUMABLE'?'text-green-600':getRarityColor(item.rarity)}/></div>
                            <div>
                              <div className={`text-sm font-bold ${item.type === 'CONSUMABLE' ? 'text-green-600' : getRarityColor(item.rarity)}`}>
                                {item.name}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {item.type === 'CONSUMABLE' ? CONSUMABLES[item.consumableId]?.desc : (
                                  <>{item.stats?.atk > 0 && `ATK:${item.stats.atk} `}{item.stats?.def > 0 && `DEF:${item.stats.def} `}WT:{item.stats?.wt}</>
                                )}
                                {!canEquip && item.type !== 'CONSUMABLE' && (
                                  <span className="ml-2 text-red-500 font-bold">装備不可</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleBuy(item)} className="bg-yellow-500 hover:bg-yellow-400 text-white px-3 py-1 rounded text-xs font-bold flex flex-col items-center min-w-[60px]">
                            <span>購入</span><span className="text-[10px]">{item.value} G</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {inventory.length === 0 && <div className="text-center text-slate-400 col-span-2 py-10">売却できるアイテムがありません</div>}
            {inventory.map((item, idx) => {
                const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
                return (
                  <div key={item.id + idx} className={`bg-white p-2 rounded border shadow-sm flex justify-between items-center ${isEquipped ? 'opacity-60 bg-slate-50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-50 p-2 rounded"><ItemIcon item={item} size={20} className={item.type==='CONSUMABLE'?'text-green-600':getRarityColor(item.rarity)}/></div>
                        <div>
                          <div className={`text-sm font-bold ${item.type === 'CONSUMABLE' ? 'text-green-600' : getRarityColor(item.rarity)}`}>
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-500">売却額: {Math.floor(item.value / 2)} G</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.locked && <Lock size={14} className="text-red-400 mr-1" />}
                      {!isEquipped ? (
                        <button onClick={() => handleSell(item)} className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded font-bold">売却</button>
                      ) : <span className="text-[10px] text-slate-400">装備中</span>}
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopView;