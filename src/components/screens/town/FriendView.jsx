import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Send, MessageCircle, Gift, Check, X, UserMinus, Ban, Unlock } from 'lucide-react'; // アイコン追加
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, updateDoc, arrayUnion, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../../lib/firebase';
import { ItemIcon } from './ItemIcon';
import { RARITY } from '../../../constants/data';

const FriendView = ({ player, inventory, setInventory, onStartChat }) => {
  const [tab, setTab] = useState('LIST'); // LIST, SEARCH, REQUESTS, BLOCK
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blacklist, setBlacklist] = useState([]); // ブロックリスト
  
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchMsg, setSearchMsg] = useState('');

  const [giftTarget, setGiftTarget] = useState(null);
  const [giftItem, setGiftItem] = useState(null);

  useEffect(() => {
    // フレンドリスト監視
    const qFriends = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friends');
    const unsubFriends = onSnapshot(qFriends, (snapshot) => {
      setFriends(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // フレンド申請監視
    const qRequests = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friendRequests');
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      setRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // ★追加: ブロックリスト監視
    const qBlacklist = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'blacklist');
    const unsubBlacklist = onSnapshot(qBlacklist, (snapshot) => {
      setBlacklist(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubFriends();
      unsubRequests();
      unsubBlacklist();
    };
  }, [player.id]);

  // ★追加: フレンド削除
  const handleRemoveFriend = async (friend) => {
    if (!window.confirm(`${friend.name} さんをフレンドから削除しますか？`)) return;
    try {
      // 自分のリストから削除
      await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friends', friend.id));
      // 相手のリストから自分を削除（相互削除）
      await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', friend.id, 'friends', player.id));
      alert('フレンドを削除しました');
    } catch (e) {
      console.error(e);
      alert('削除に失敗しました: ' + e.message);
    }
  };

  // ★追加: ブロック
  const handleBlockUser = async (target) => {
    if (!window.confirm(`${target.name} さんをブロックしますか？\n(フレンド解除され、今後申請も届かなくなります)`)) return;
    try {
      // ブロックリストに追加
      await setDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'blacklist', target.id), {
        name: target.name,
        id: target.id,
        createdAt: serverTimestamp()
      });

      // フレンドだった場合は削除 (両方向)
      if (friends.some(f => f.id === target.id)) {
        await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friends', target.id));
        await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', target.id, 'friends', player.id));
      }
      
      // 申請が来ていたら削除
      await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friendRequests', target.id));

      alert('ブロックしました');
      setSearchResult(null); // 検索結果からもクリア
    } catch (e) {
      console.error(e);
      alert('ブロックに失敗しました: ' + e.message);
    }
  };

  // ★追加: ブロック解除
  const handleUnblock = async (targetId) => {
    if (!window.confirm('ブロックを解除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'blacklist', targetId));
      alert('ブロックを解除しました');
    } catch (e) {
      console.error(e);
      alert('解除に失敗しました');
    }
  };

  const handleSearch = async () => {
    setSearchResult(null);
    setSearchMsg('');
    if (!searchId) return;
    if (searchId === player.id) {
      setSearchMsg('自分のIDは検索できません');
      return;
    }

    try {
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

  const handleSendRequest = async () => {
    if (!searchResult) return;
    try {
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

  const handleAccept = async (req) => {
    try {
      await setDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friends', req.id), {
        name: req.name,
        level: req.level,
        id: req.id,
        createdAt: serverTimestamp()
      });
      await setDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', req.id, 'friends', player.id), {
        name: player.name,
        level: player.level,
        id: player.id,
        createdAt: serverTimestamp()
      });
      await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friendRequests', req.id));
      alert(`${req.name} さんとフレンドになりました！`);
    } catch (e) {
      console.error(e);
      alert('承認エラー: ' + e.message);
    }
  };

  const handleDeleteRequest = async (targetId) => {
    try {
      await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friendRequests', targetId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendGift = async () => {
    if (!giftTarget || !giftItem) return;
    if (!window.confirm(`${giftTarget.name} さんに\n${giftItem.name} をプレゼントしますか？\n(自分の持ち物からなくなります)`)) return;

    try {
      setInventory(prev => prev.filter(i => i.id !== giftItem.id));

      const giftRef = collection(db, 'artifacts', GAME_APP_ID, 'users', giftTarget.id, 'gifts');
      await addDoc(giftRef, {
        senderId: player.id,
        senderName: player.name,
        item: giftItem,
        createdAt: serverTimestamp()
      });

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

  // ブロック中のユーザーIDリスト
  const blockedIds = blacklist.map(b => b.id);
  // 表示用リクエストリスト (ブロック済みユーザーを除外)
  const visibleRequests = requests.filter(req => !blockedIds.includes(req.id));

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
      <div className="p-4 border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setTab('LIST')} className={`flex-shrink-0 px-3 py-1 rounded text-xs font-bold ${tab === 'LIST' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>フレンド</button>
        <button onClick={() => setTab('SEARCH')} className={`flex-shrink-0 px-3 py-1 rounded text-xs font-bold ${tab === 'SEARCH' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>検索・追加</button>
        <button onClick={() => setTab('REQUESTS')} className={`flex-shrink-0 px-3 py-1 rounded text-xs font-bold ${tab === 'REQUESTS' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          申請 {visibleRequests.length > 0 && `(${visibleRequests.length})`}
        </button>
        <button onClick={() => setTab('BLOCK')} className={`flex-shrink-0 px-3 py-1 rounded text-xs font-bold ${tab === 'BLOCK' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          ブロック中
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'LIST' && (
          <div className="space-y-2">
            {friends.length === 0 && <div className="text-center text-slate-400 py-10">フレンドがいません。<br/>検索して追加しましょう！</div>}
            {friends.map(f => (
              <div key={f.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm relative group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-slate-700">{f.name}</div>
                    <div className="text-xs text-slate-400">Lv.{f.level}</div>
                  </div>
                  {/* 管理メニュー（ホバーまたは常時表示） */}
                  <div className="flex gap-1">
                    <button onClick={() => handleRemoveFriend(f)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded" title="フレンド削除">
                      <UserMinus size={16}/>
                    </button>
                    <button onClick={() => handleBlockUser(f)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded" title="ブロック">
                      <Ban size={16}/>
                    </button>
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
                
                {blockedIds.includes(searchResult.id) ? (
                  <div className="text-red-500 text-sm font-bold text-center border border-red-200 bg-red-50 py-2 rounded">
                    ブロック中のユーザーです
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSendRequest} className="flex-1 bg-teal-600 text-white py-2 rounded font-bold hover:bg-teal-500 flex items-center justify-center gap-2">
                      <UserPlus size={18}/> 申請する
                    </button>
                    <button onClick={() => handleBlockUser(searchResult)} className="px-3 bg-slate-200 text-slate-500 rounded hover:bg-red-100 hover:text-red-500" title="ブロック">
                      <Ban size={18}/>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'REQUESTS' && (
          <div className="space-y-2">
            {visibleRequests.length === 0 && <div className="text-center text-slate-400 py-10">届いている申請はありません</div>}
            {visibleRequests.map(req => (
              <div key={req.id} className="bg-white p-3 rounded border border-orange-200 shadow-sm flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-700">{req.name}</div>
                  <div className="text-xs text-slate-400">Lv.{req.level}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(req)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"><Check size={16}/></button>
                  <button onClick={() => handleDeleteRequest(req.id)} className="bg-slate-200 text-slate-500 p-2 rounded hover:bg-slate-300"><X size={16}/></button>
                  <button onClick={() => handleBlockUser(req)} className="bg-slate-100 text-slate-400 p-2 rounded hover:bg-red-100 hover:text-red-500" title="ブロック"><Ban size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'BLOCK' && (
          <div className="space-y-2">
            {blacklist.length === 0 && <div className="text-center text-slate-400 py-10">ブロック中のユーザーはいません</div>}
            {blacklist.map(user => (
              <div key={user.id} className="bg-slate-50 p-3 rounded border border-slate-200 flex justify-between items-center opacity-75">
                <div>
                  <div className="font-bold text-slate-600">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{user.id}</div>
                </div>
                <button onClick={() => handleUnblock(user.id)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-300 flex items-center gap-1">
                  <Unlock size={14}/> 解除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendView;