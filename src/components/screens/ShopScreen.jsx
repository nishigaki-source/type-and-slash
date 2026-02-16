import React, { useState } from 'react';
import { ShoppingBag, Coins } from 'lucide-react';
import { RARITY, CONSUMABLES } from '../../constants/data';

const ShopScreen = ({ player, inventory, equipped, setPlayer, setInventory, onBack, shopItems, onRefreshShop }) => {
  const [tab, setTab] = useState('BUY'); // BUY, SELL

  const handleBuy = (item) => {
    if (player.gold < item.value) {
      alert('ゴールドが足りません！');
      return;
    }
    setPlayer(prev => ({ ...prev, gold: prev.gold - item.value }));
    setInventory(prev => [...prev, item]);
    // 購入したアイテムをショップリストから削除
    const newShopItems = shopItems.filter(i => i.id !== item.id);
    onRefreshShop(newShopItems);
  };

  const handleSell = (item) => {
    // 装備中は売却不可
    const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
    if (isEquipped) {
      alert('装備中のアイテムは売却できません！');
      return;
    }

    const sellPrice = Math.floor(item.value / 2);
    setPlayer(prev => ({ ...prev, gold: prev.gold + sellPrice }));
    setInventory(prev => prev.filter(i => i.id !== item.id));
  };

  return (
    <div className="h-full bg-slate-50 text-slate-800 flex flex-col">
      <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-700"><ShoppingBag /> ショップ</h2>
        <div className="flex gap-4 items-center">
          <div className="text-yellow-600 font-bold flex items-center gap-1"><Coins size={16}/> {player.gold} G</div>
          <button onClick={onBack} className="bg-slate-200 px-4 py-2 rounded hover:bg-slate-300 text-slate-700 font-bold">町へ戻る</button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-white">
        <button 
          onClick={() => setTab('BUY')}
          className={`flex-1 py-3 font-bold ${tab === 'BUY' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          購入する
        </button>
        <button 
          onClick={() => setTab('SELL')}
          className={`flex-1 py-3 font-bold ${tab === 'SELL' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          売却する
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {tab === 'BUY' && (
          <div className="grid grid-cols-2 gap-3">
             {shopItems.length === 0 ? (
               <div className="col-span-2 text-center text-slate-500 py-10">売り切れです。ステージをクリアして入荷を待ちましょう。</div>
             ) : (
               shopItems.map(item => (
                 <div key={item.id} className="bg-white p-3 rounded border border-slate-200 flex justify-between items-center shadow-sm">
                   <div>
                     <div className={`text-sm font-bold ${item.type === 'CONSUMABLE' ? 'text-green-600' : RARITY[item.rarity.toUpperCase()].color}`}>{item.name}</div>
                     <div className="text-xs text-slate-500 mt-1">
                        {item.type === 'CONSUMABLE' ? '消耗品' : (
                          <>
                            {(item.stats?.atk || 0) > 0 && `ATK:${item.stats.atk} `}
                            {(item.stats?.def || 0) > 0 && `DEF:${item.stats.def} `}
                            <span className="text-slate-400">WT:{item.stats.wt}</span>
                          </>
                        )}
                     </div>
                   </div>
                   <button 
                     onClick={() => handleBuy(item)}
                     className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-white text-xs rounded flex flex-col items-center min-w-[60px]"
                   >
                     <span>購入</span>
                     <span className="text-[10px]">{item.value} G</span>
                   </button>
                 </div>
               ))
             )}
          </div>
        )}

        {tab === 'SELL' && (
          <div className="grid grid-cols-2 gap-3">
             {inventory.length === 0 ? (
               <div className="col-span-2 text-center text-slate-500 py-10">売却できるアイテムがありません</div>
             ) : (
               inventory.map(item => {
                 const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
                 return (
                   <div key={item.id} className={`bg-white p-3 rounded border flex justify-between items-center shadow-sm ${isEquipped ? 'border-yellow-400 opacity-70' : 'border-slate-200'}`}>
                     <div>
                       <div className={`text-sm font-bold ${item.type === 'CONSUMABLE' ? 'text-green-600' : RARITY[item.rarity.toUpperCase()].color}`}>
                         {item.name} {isEquipped && <span className="text-yellow-600 text-[10px] ml-1">[装備中]</span>}
                       </div>
                       <div className="text-xs text-slate-500 mt-1">
                          {item.type === 'CONSUMABLE' ? '消耗品' : (
                            <>
                              {(item.stats?.atk || 0) > 0 && `ATK:${item.stats.atk} `}
                              {(item.stats?.def || 0) > 0 && `DEF:${item.stats.def} `}
                            </>
                          )}
                       </div>
                     </div>
                     {!isEquipped ? (
                       <button 
                         onClick={() => handleSell(item)}
                         className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded flex flex-col items-center min-w-[60px]"
                       >
                         <span>売却</span>
                         <span className="text-[10px]">{Math.floor(item.value / 2)} G</span>
                       </button>
                     ) : (
                       <div className="text-xs text-yellow-600 font-bold px-2">売却不可</div>
                     )}
                   </div>
                 );
               })
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopScreen;