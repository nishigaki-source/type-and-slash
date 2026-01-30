import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Send, MessageCircle, Gift, Check, X } from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../../lib/firebase';
import { ItemIcon } from './ItemIcon';
import { RARITY } from '../../../constants/data';

const FriendView = ({ player, inventory, setInventory, onStartChat }) => {
  const [tab, setTab] = useState('LIST'); // LIST, SEARCH, REQUESTS
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // 検索用
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchMsg, setSearchMsg] = useState('');

  // プレゼント用
  const [giftTarget, setGiftTarget] = useState(null); // フレンドオブジェクト
  const [giftItem, setGiftItem] = useState(null); // 選択したアイテム

  // データ読み込み
  useEffect(() => {
    // フレンドリストの監視 (users/{myId}/friends)
    const qFriends = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friends');
    const unsubFriends = onSnapshot(qFriends, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setFriends(list);
    });

    // フレンド申請の監視 (users/{myId}/friendRequests)
    const qRequests = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friendRequests');
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(list);
    });

    return () => {
      unsubFriends();
      unsubRequests();
    };
  }, [player.id]);

  // ユーザー検索
  const handleSearch = async () => {
    setSearchResult(null);
    setSearchMsg('');
    if (!searchId) return;
    if (searchId === player.id) {
      setSearchMsg('自分のIDは検索できません');
      return;
    }

    try {
      // ユーザーデータの存在確認 (saveData/current を参照)
      const docRef = doc(db, 'artifacts', GAME_APP_ID, 'users', searchId, 'saveData', 'current');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setSearchResult({ id: searchId, name: data.player.name, level: data.player.level });
      } else {
        setSearchMsg('ユーザーが見つかりませんでした');
      }
    } catch (e) {
      setSearchMsg('検索エラー: ' + e.message);
    }
  };

  // 申請送信
  const handleSendRequest = async () => {
    if (!searchResult) return;
    try {
      // 相手の friendRequests に自分の情報を書き込む
      const ref = doc(db, 'artifacts', GAME_APP_ID, 'users', searchResult.id, 'friendRequests', player.id);
      await setDoc(ref, {
        name: player.name,
        level: player.level,
        id: player.id,
        createdAt: serverTimestamp()
      });
      alert('フレンド申請を送りました！');
      setSearchResult(null);
      setSearchId('');
    } catch (e) {
      alert('送信失敗: ' + e.message);
    }
  };

  // 申請承認
  const handleAccept = async (req) => {
    try {
      // 自分の friends に追加
      await setDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friends', req.id), {
        name: req.name,
        level: req.level,
        id: req.id,
        createdAt: serverTimestamp()
      });
      // 相手の friends に自分を追加
      await setDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', req.id, 'friends', player.id), {
        name: player.name,
        level: player.level,
        id: player.id,
        createdAt: serverTimestamp()
      });
      // 申請を削除
      await deleteRequest(req.id);
      alert(`${req.name} さんとフレンドになりました！`);
    } catch (e) {
      console.error(e);
    }
  };

  // 申請拒否/削除
  const deleteRequest = async (targetId) => {
    await setDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friendRequests', targetId), {}, { merge: false }); // 削除の代わりに空にするか、deleteDocを使うべきだが、簡単のため上書き削除的な処理（実際は deleteDoc が必要）
    // deleteDoc を使うため import が必要ですが、ここでは省略して setDoc で無効化する擬似処理とします
    // 正しくは: await deleteDoc(doc(db, ...));
    const { deleteDoc } = await import('firebase/firestore'); // ダイナミックインポートまたは上のimportに追加
    await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friendRequests', targetId));
  };

  // プレゼント送信処理
  const handleSendGift = async () => {
    if (!giftTarget || !giftItem) return;
    if (!window.confirm(`${giftTarget.name} さんに\n${giftItem.name} をプレゼントしますか？\n(自分の持ち物からなくなります)`)) return;

    try {
      // 自分のインベントリから削除
      setInventory(prev => prev.filter(i => i.id !== giftItem.id));

      // 相手の inventory に直接追加 (簡易実装)
      // 本来は相手の「プレゼントボックス」コレクションに送るのが安全ですが、
      // ここでは仕様通り「プレゼントする」を実現するため、相手のセーブデータを更新します。
      // ※ トランザクション推奨ですが、簡易的に実装します。
      
      const targetRef = doc(db, 'artifacts', GAME_APP_ID, 'users', giftTarget.id, 'saveData', 'current');
      await updateDoc(targetRef, {
        inventory: arrayUnion(giftItem)
      });

      // メールで通知を送る
      await addDoc(collection(db, 'artifacts', GAME_APP_ID, 'chats'), {
        participants: [player.id, giftTarget.id].sort(),
        senderId: player.id,
        text: `🎁 アイテム「${giftItem.name}」をプレゼントしました！`,
        createdAt: serverTimestamp()
      });

      alert('プレゼントを送りました！');
      setGiftTarget(null);
      setGiftItem(null);
    } catch (e) {
      console.error(e);
      alert('送信失敗: ' + e.message);
    }
  };

  // プレゼント選択モーダル
  if (giftTarget) {
    return (
      <div className="absolute inset-0 z-50 bg-white p-4 flex flex-col animate-fade-in">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Gift className="text-pink-500"/> プレゼント選択: {giftTarget.name}
        </h3>
        <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-2 mb-4">
          {inventory.length === 0 && <div className="text-slate-400 text-center py-10">送れるアイテムがありません</div>}
          {inventory.map(item => (
            <div key={item.id} className={`p-2 border rounded flex justify-between items-center cursor-pointer ${giftItem?.id === item.id ? 'bg-blue-50 border-blue-500' : 'bg-white'}`} onClick={() => setGiftItem(item)}>
              <div className="flex items-center gap-2">
                <ItemIcon item={item} />
                <span className={`text-sm font-bold ${RARITY[item.rarity.toUpperCase()]?.color}`}>{item.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setGiftTarget(null)} className="flex-1 py-3 bg-slate-200 rounded font-bold">キャンセル</button>
          <button onClick={handleSendGift} disabled={!giftItem} className="flex-1 py-3 bg-pink-500 text-white rounded font-bold disabled:bg-slate-300">送信</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in">
      <div className="p-4 border-b border-slate-200 flex gap-2">
        <button onClick={() => setTab('LIST')} className={`flex-1 py-1 rounded text-xs font-bold ${tab === 'LIST' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>フレンド</button>
        <button onClick={() => setTab('SEARCH')} className={`flex-1 py-1 rounded text-xs font-bold ${tab === 'SEARCH' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>検索・追加</button>
        <button onClick={() => setTab('REQUESTS')} className={`flex-1 py-1 rounded text-xs font-bold ${tab === 'REQUESTS' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>申請 {requests.length > 0 && `(${requests.length})`}</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'LIST' && (
          <div className="space-y-2">
            {friends.length === 0 && <div className="text-center text-slate-400 py-10">フレンドがいません。<br/>検索して追加しましょう！</div>}
            {friends.map(f => (
              <div key={f.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-700">{f.name}</div>
                    <div className="text-xs text-slate-400">Lv.{f.level}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => onStartChat(f)} className="flex-1 bg-blue-100 text-blue-600 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-200">
                    <MessageCircle size={14}/> チャット
                  </button>
                  <button onClick={() => setGiftTarget(f)} className="flex-1 bg-pink-100 text-pink-600 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-pink-200">
                    <Gift size={14}/> プレゼント
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'SEARCH' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="ユーザーIDを入力" 
                className="flex-1 border border-slate-300 rounded p-2 text-sm"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
              />
              <button onClick={handleSearch} className="bg-teal-600 text-white p-2 rounded"><Search size={20}/></button>
            </div>
            
            {searchMsg && <div className="text-xs text-red-500">{searchMsg}</div>}

            {searchResult && (
              <div className="bg-white p-4 rounded border border-teal-200 shadow-sm">
                <div className="font-bold text-lg mb-1">{searchResult.name}</div>
                <div className="text-sm text-slate-500 mb-4">Lv.{searchResult.level}</div>
                <button onClick={handleSendRequest} className="w-full bg-teal-600 text-white py-2 rounded font-bold hover:bg-teal-500 flex items-center justify-center gap-2">
                  <UserPlus size={18}/> フレンド申請を送る
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'REQUESTS' && (
          <div className="space-y-2">
            {requests.length === 0 && <div className="text-center text-slate-400 py-10">届いている申請はありません</div>}
            {requests.map(req => (
              <div key={req.id} className="bg-white p-3 rounded border border-orange-200 shadow-sm flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-700">{req.name}</div>
                  <div className="text-xs text-slate-400">Lv.{req.level}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(req)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"><Check size={16}/></button>
                  <button onClick={() => deleteRequest(req.id)} className="bg-slate-200 text-slate-500 p-2 rounded hover:bg-slate-300"><X size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendView;