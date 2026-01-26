import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Search, Filter, Coins } from 'lucide-react';
import { 
  collection, addDoc, query, onSnapshot, runTransaction, doc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { db, GAME_APP_ID, auth } from '../../../lib/firebase';
import { ITEM_TYPES, RARITY, CONSUMABLES } from '../../../constants/data';
import { ItemIcon } from './ItemIcon';

// 形容詞リスト
const ADJECTIVES = ['古びた', '普通の', '上質な', '重厚な', '軽量な', '伝説の', '神々の'];
// レアリティ順
const RARITY_ORDER = ['n', 'r', 'sr', 'ur', 'lr'];

const TradeView = ({ player, inventory, equipped, setPlayer, setInventory }) => {
  const [tradeTab, setTradeTab] = useState('SEARCH'); 
  const [tradeList, setTradeList] = useState([]);
  const [tradeStep, setTradeStep] = useState('SELECT'); 
  const [tradeItem, setTradeItem] = useState(null);
  const [tradePrice, setTradePrice] = useState(0);
  
  const [wantedAdj, setWantedAdj] = useState(ADJECTIVES[1]);
  const [wantedType, setWantedType] = useState('剣'); 
  const [wantedRarity, setWantedRarity] = useState('n');
  const [isRarityOrHigher, setIsRarityOrHigher] = useState(true);

  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterRarity, setFilterRarity] = useState('ALL');

  const [isTradeLoading, setIsTradeLoading] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null); 
  const [exchangeCandidates, setExchangeCandidates] = useState([]);

  const getRarityColor = (rarity) => {
    if (!rarity) return RARITY.N.color;
    const key = rarity.toUpperCase();
    return (RARITY[key] || RARITY.N).color;
  };

  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', GAME_APP_ID, 'trades'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTradeList(trades);
    });
    return () => unsubscribe();
  }, []);

  const handleTradeSubmit = async () => {
    if (!tradeItem) return;
    if (tradePrice < 0) {
      alert('価格は0以上で設定してください');
      return;
    }
    const wantedItemName = `${wantedAdj}${wantedType}`;
    
    if (!window.confirm(`${tradeItem.name} を ${tradePrice}G で出品しますか？\n希望: ${wantedItemName} (${RARITY[wantedRarity.toUpperCase()].name}${isRarityOrHigher ? '以上' : ''})`)) return;

    try {
      setIsTradeLoading(true);
      await addDoc(collection(db, 'artifacts', GAME_APP_ID, 'trades'), {
        sellerId: auth.currentUser.uid,
        sellerName: player.name,
        item: tradeItem,
        price: tradePrice,
        wantedItemName: wantedItemName,
        wantedRarity: wantedRarity,
        isRarityOrHigher: isRarityOrHigher,
        createdAt: serverTimestamp(),
        status: 'active'
      });

      setInventory(prev => prev.filter(i => i.id !== tradeItem.id));
      alert('出品しました！');
      setTradeItem(null);
      setTradeStep('SELECT');
      setTradeTab('SEARCH');
    } catch (e) {
      console.error(e);
      alert('出品に失敗しました: ' + e.message);
    } finally {
      setIsTradeLoading(false);
    }
  };

  const checkExchangeable = (trade) => {
    if (player.gold < trade.price) return { ok: false, reason: 'ゴールド不足' };

    const candidates = inventory.filter(myItem => {
      const isEquipped = Object.values(equipped).some(e => e && e.id === myItem.id);
      if (isEquipped) return false;
      if (myItem.type === 'CONSUMABLE') return false;

      if (myItem.name !== trade.wantedItemName) return false;

      const myRarityIndex = RARITY_ORDER.indexOf(myItem.rarity);
      const wantedRarityIndex = RARITY_ORDER.indexOf(trade.wantedRarity);
      
      if (trade.isRarityOrHigher) {
        return myRarityIndex >= wantedRarityIndex;
      } else {
        return myRarityIndex === wantedRarityIndex;
      }
    });

    if (candidates.length === 0) return { ok: false, reason: '希望アイテム所持なし' };

    return { ok: true, candidates };
  };

  const handleStartExchange = (trade) => {
    if (trade.sellerId === auth.currentUser.uid) {
      alert('自分の出品物は購入できません'); 
      return;
    }
    
    const check = checkExchangeable(trade);
    if (!check.ok) {
      alert(`交換できません: ${check.reason}`);
      return;
    }

    setSelectedTrade(trade);
    setExchangeCandidates(check.candidates);
    setShowExchangeModal(true);
  };

  const handleExecuteExchange = async (offerItem) => {
    if (!selectedTrade || !offerItem) return;
    
    if (!window.confirm(`${offerItem.name} と ${selectedTrade.price}G を支払って\n${selectedTrade.item.name} と交換しますか？`)) return;

    try {
      setIsTradeLoading(true);
      setShowExchangeModal(false);

      await runTransaction(db, async (transaction) => {
        const tradeRef = doc(db, 'artifacts', GAME_APP_ID, 'trades', selectedTrade.id);
        const sellerRef = doc(db, 'artifacts', GAME_APP_ID, 'users', selectedTrade.sellerId, 'saveData', 'current');
        const buyerRef = doc(db, 'artifacts', GAME_APP_ID, 'users', auth.currentUser.uid, 'saveData', 'current');

        const tradeDoc = await transaction.get(tradeRef);
        if (!tradeDoc.exists()) throw "この取引は既に終了しています";

        const sellerDoc = await transaction.get(sellerRef);
        const buyerDoc = await transaction.get(buyerRef);

        if (!sellerDoc.exists() || !buyerDoc.exists()) throw "ユーザーデータが見つかりません";

        const sellerData = sellerDoc.data();
        const buyerData = buyerDoc.data();

        const newSellerGold = sellerData.player.gold + selectedTrade.price;
        const newBuyerGold = buyerData.player.gold - selectedTrade.price;
        if (newBuyerGold < 0) throw "ゴールドが足りません";

        const newSellerInventory = [...(sellerData.inventory || []), offerItem];
        let newBuyerInventory = (buyerData.inventory || []).filter(i => i.id !== offerItem.id);
        newBuyerInventory.push(selectedTrade.item);

        transaction.update(sellerRef, { 
          "player.gold": newSellerGold,
          "inventory": newSellerInventory
        });
        transaction.update(buyerRef, { 
          "player.gold": newBuyerGold,
          "inventory": newBuyerInventory
        });
        transaction.delete(tradeRef); 
      });

      setPlayer(prev => ({ ...prev, gold: prev.gold - selectedTrade.price }));
      setInventory(prev => {
        const temp = prev.filter(i => i.id !== offerItem.id);
        return [...temp, selectedTrade.item];
      });
      alert('トレード成立！アイテムを交換しました。');
      setSelectedTrade(null);

    } catch (e) {
      console.error(e);
      alert('トレード処理に失敗しました: ' + e);
    } finally {
      setIsTradeLoading(false);
    }
  };

  const filteredTradeList = tradeList.filter(trade => {
     const item = trade.item;
     if (filterName && !item.name.includes(filterName)) return false;
     if (filterType !== 'ALL' && item.type !== filterType) return false;
     if (filterRarity !== 'ALL' && item.rarity !== filterRarity) return false;
     return true;
  });

  const tradeableItems = inventory.filter(item => 
    item.type !== 'CONSUMABLE' && ['r', 'sr', 'ur', 'lr'].includes(item.rarity)
  );

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in relative">
      {isTradeLoading && <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}
      
      {showExchangeModal && selectedTrade && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm max-h-[80%] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-100 border-b font-bold text-center">交換に出すアイテムを選択</div>
            <div className="p-4 border-b bg-yellow-50 text-xs">
              <p>交換条件: <span className="font-bold">{selectedTrade.wantedItemName}</span></p>
              <p>レアリティ: <span className="font-bold">{RARITY[selectedTrade.wantedRarity.toUpperCase()].name}{selectedTrade.isRarityOrHigher ? '以上' : ''}</span></p>
              <p>支払ゴールド: <span className="font-bold text-yellow-600">{selectedTrade.price} G</span></p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {exchangeCandidates.map(item => (
                <div key={item.id} className="bg-white border rounded p-2 flex justify-between items-center cursor-pointer hover:bg-blue-50" onClick={() => handleExecuteExchange(item)}>
                  <div className="flex items-center gap-2">
                    <ItemIcon item={item} size={20} className={getRarityColor(item.rarity)} />
                    <div>
                      <div className={`text-sm font-bold ${getRarityColor(item.rarity)}`}>{item.name}</div>
                      <div className="text-[10px] text-slate-500">WT:{item.stats.wt}</div>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">決定</button>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowExchangeModal(false); setSelectedTrade(null); }} className="p-3 bg-slate-200 text-slate-600 font-bold hover:bg-slate-300">キャンセル</button>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800"><ArrowLeftRight /> トレード</h2>
        <div className="flex gap-2">
          <button onClick={() => setTradeTab('SEARCH')} className={`px-4 py-1 rounded text-sm font-bold ${tradeTab === 'SEARCH' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>探す</button>
          <button onClick={() => setTradeTab('SELL')} className={`px-4 py-1 rounded text-sm font-bold ${tradeTab === 'SELL' ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>出品</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tradeTab === 'SEARCH' ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                  <Filter size={14} /> 絞り込み検索
               </div>
               <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="アイテム名" 
                      value={filterName}
                      onChange={e => setFilterName(e.target.value)}
                      className="w-full p-2 pl-7 border rounded text-sm"
                    />
                  </div>
               </div>
               <div className="flex gap-2">
                  <select value={filterType} onChange={e => setFilterType(e.target.value)} className="flex-1 p-2 border rounded text-xs bg-white">
                     <option value="ALL">全部位</option>
                     {Object.entries(ITEM_TYPES).map(([key, label]) => (key !== 'CONSUMABLE' && <option key={key} value={key}>{label}</option>))}
                  </select>
                  <select value={filterRarity} onChange={e => setFilterRarity(e.target.value)} className="flex-1 p-2 border rounded text-xs bg-white">
                     <option value="ALL">全レア度</option>
                     {Object.values(RARITY).map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                  </select>
               </div>
            </div>

            <div className="space-y-2">
              {filteredTradeList.length === 0 && <div className="text-center text-slate-400 py-10">該当するアイテムはありません</div>}
              {filteredTradeList.map(trade => (
                <div key={trade.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded"><ItemIcon item={trade.item} size={24} className={getRarityColor(trade.item.rarity)} /></div>
                      <div>
                        <div className={`font-bold ${getRarityColor(trade.item.rarity)}`}>{trade.item.name}</div>
                        <div className="text-xs text-slate-500 flex gap-2">
                          <span>出品: {trade.sellerName}</span>
                          {trade.item.uniqueCode && <span className="text-yellow-600 font-mono">{trade.item.uniqueCode}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">{trade.price} G</div>
                    </div>
                  </div>
                  
                  <div className="text-xs bg-slate-100 p-2 rounded mb-2 text-slate-600">
                    <span className="font-bold">求:</span> {trade.wantedItemName} ({RARITY[trade.wantedRarity.toUpperCase()].name}{trade.isRarityOrHigher ? '以上' : ''})
                  </div>

                  <button 
                    onClick={() => handleStartExchange(trade)}
                    disabled={trade.sellerId === auth.currentUser.uid}
                    className="w-full py-2 bg-blue-600 disabled:bg-slate-300 text-white rounded font-bold text-sm hover:bg-blue-500 transition-colors"
                  >
                    {trade.sellerId === auth.currentUser.uid ? '出品中' : '交換を申し込む'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          tradeStep === 'SELECT' ? (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-600 mb-2">出品するアイテムを選択 (R以上: テスト中)</h3>
              <div className="text-xs text-slate-500 mb-2">※テストのため一時的にR以上のアイテムが出品可能です</div>
              {tradeableItems.length === 0 ? (
                <div className="text-center text-slate-400 py-4 border-2 border-dashed border-slate-300 rounded-lg">
                  出品可能なアイテム（R以上）がありません
                </div>
              ) : (
                tradeableItems.map(item => (
                  <div key={item.id} className="bg-white p-2 border rounded flex justify-between items-center cursor-pointer hover:border-blue-400" onClick={() => { setTradeItem(item); setTradeStep('FORM'); }}>
                    <div className="flex items-center gap-2">
                      <ItemIcon item={item} size={20} className={getRarityColor(item.rarity)} />
                      <div className={`text-sm font-bold ${getRarityColor(item.rarity)}`}>{item.name} {item.uniqueCode}</div>
                    </div>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">選択</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <div className="mb-4">
                <div className="text-xs text-slate-500">出品アイテム</div>
                <div className={`text-lg font-bold flex items-center gap-2 ${getRarityColor(tradeItem.rarity)}`}>
                  <ItemIcon item={tradeItem} size={24} className={getRarityColor(tradeItem.rarity)} />
                  {tradeItem.name} {tradeItem.uniqueCode}
                </div>
              </div>
              
              <div className="mb-4 bg-white p-3 rounded border">
                <div className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">希望条件の設定</div>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs text-slate-500">形容詞</label>
                    <select value={wantedAdj} onChange={e => setWantedAdj(e.target.value)} className="w-full border rounded p-1 text-sm">
                      {ADJECTIVES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">種類</label>
                    <select value={wantedType} onChange={e => setWantedType(e.target.value)} className="w-full border rounded p-1 text-sm">
                      {Object.values(ITEM_TYPES).filter(t => t !== '道具').map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="text-sm font-bold text-center text-blue-600 mb-3 bg-blue-50 py-1 rounded">
                  求: {wantedAdj}{wantedType}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500">レアリティ</label>
                    <select value={wantedRarity} onChange={e => setWantedRarity(e.target.value)} className="w-full border rounded p-1 text-sm">
                      {Object.values(RARITY).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center mt-4">
                    <input type="checkbox" id="rarityCheck" checked={isRarityOrHigher} onChange={e => setIsRarityOrHigher(e.target.checked)} className="mr-1"/>
                    <label htmlFor="rarityCheck" className="text-xs font-bold">以上</label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-1">販売価格 (G)</label>
                <input type="number" value={tradePrice} onChange={e => setTradePrice(Number(e.target.value))} className="w-full p-2 border rounded" min="0" />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setTradeStep('SELECT')} className="flex-1 py-2 bg-slate-300 rounded font-bold text-sm">戻る</button>
                <button onClick={handleTradeSubmit} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold text-sm">出品確定</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TradeView;