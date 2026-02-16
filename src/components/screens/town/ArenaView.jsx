import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Crown } from 'lucide-react';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../../lib/firebase';
import { ARENA_RANKS } from '../../../constants/data';
import { getArenaRank, calculateEffectiveStats } from '../../../utils/gameLogic';

const ArenaView = ({ player, equipped, userId, onStartMatch }) => {
  const [rooms, setRooms] = useState([]);
  const [waitingRoomId, setWaitingRoomId] = useState(null);

  const currentPoints = player.arenaPoints || 0;
  const currentRank = getArenaRank(currentPoints);
  
  // バトル用ステータス計算
  const eff = calculateEffectiveStats(player, equipped);
  
  // HP倍率（試合時間調整用）
  const HP_MULTIPLIER = 3;

  const myBattleStats = {
    id: userId,
    name: player.name,
    job: player.job,
    level: player.level,
    hp: (eff?.battle.maxHp || 100) * HP_MULTIPLIER,
    maxHp: (eff?.battle.maxHp || 100) * HP_MULTIPLIER,
    gender: player.gender,
    race: player.race,
    rankId: currentRank.id // ランクIDも保存 (ペナルティ計算用)
  };

  // 待機中のアリーナルーム監視
  useEffect(() => {
    if (waitingRoomId) return; 

    const q = query(
      collection(db, 'artifacts', GAME_APP_ID, 'rooms'),
      where('status', '==', 'WAITING'),
      where('type', '==', 'ARENA') 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      roomList.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setRooms(roomList);
    });

    return () => unsubscribe();
  }, [waitingRoomId]);

  // 自分が作成したルームの監視
  useEffect(() => {
    if (!waitingRoomId) return;

    const unsub = onSnapshot(doc(db, 'artifacts', GAME_APP_ID, 'rooms', waitingRoomId), (docSnap) => {
      if (!docSnap.exists()) {
        setWaitingRoomId(null);
        return;
      }
      const data = docSnap.data();
      if (data.status === 'PLAYING') {
        const role = data.host.id === userId ? 'HOST' : 'GUEST';
        onStartMatch(waitingRoomId, role);
      }
    });
    return () => unsub();
  }, [waitingRoomId, userId, onStartMatch]);

  const handleCreateMatch = async () => {
    try {
      const roomRef = await addDoc(collection(db, 'artifacts', GAME_APP_ID, 'rooms'), {
        host: { ...myBattleStats, rank: currentRank.name },
        guest: null,
        type: 'ARENA',
        difficulty: 'NORMAL',
        status: 'WAITING',
        createdAt: serverTimestamp(),
        logs: []
      });
      setWaitingRoomId(roomRef.id);
    } catch (e) {
      console.error(e);
      alert('対戦作成に失敗しました');
    }
  };

  // ★修正: キャンセル時にルームを削除する処理
  const handleCancelMatch = async () => {
    if (!waitingRoomId) return;
    try {
      await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'rooms', waitingRoomId));
      setWaitingRoomId(null);
    } catch (e) {
      console.error("Cancel Error:", e);
      alert("キャンセルに失敗しました");
    }
  };

  const handleJoinMatch = async (roomId) => {
    try {
      const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId);
      await updateDoc(roomRef, {
        guest: { ...myBattleStats, rank: currentRank.name },
        status: 'PLAYING'
      });
      onStartMatch(roomId, 'GUEST');
    } catch (e) {
      alert('参加に失敗しました（既に埋まっている可能性があります）');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black"></div>

      <div className="p-6 border-b border-slate-700 bg-slate-800/50 backdrop-blur relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black italic flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
              <Swords size={32} className="text-yellow-400"/> BATTLE ARENA
            </h2>
            <p className="text-slate-400 text-sm">最強の座を賭けて戦え！</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black ${currentRank.color} drop-shadow-lg`}>{currentRank.name}</div>
            <div className="text-sm text-slate-400 font-mono">{currentPoints} Pt</div>
          </div>
        </div>
        
        <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-500 w-full" style={{ width: `${Math.min(100, (currentPoints / (currentRank.max + 1)) * 100)}%` }}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        
        {waitingRoomId ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="animate-spin text-purple-500"><Swords size={64} /></div>
            <div className="text-xl font-bold animate-pulse">対戦相手を待っています...</div>
            <button 
              onClick={handleCancelMatch}
              className="px-6 py-2 bg-slate-700 rounded hover:bg-slate-600"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <button 
              onClick={handleCreateMatch}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 border border-purple-400/30"
            >
              <Crown size={24} /> ランクマッチにエントリー
            </button>

            <div>
              <h3 className="text-slate-400 font-bold mb-3 border-l-4 border-purple-500 pl-3">対戦待ちプレイヤー</h3>
              <div className="grid grid-cols-1 gap-3">
                {rooms.length === 0 && (
                  <div className="text-slate-500 text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">
                    待機中のプレイヤーはいません。<br/>エントリーして対戦相手を待ちましょう。
                  </div>
                )}
                {rooms.map(room => (
                  <div key={room.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center hover:border-purple-500 transition-colors">
                    <div>
                      <div className="font-bold text-lg">{room.host.name}</div>
                      <div className="text-xs text-slate-400">Rank: <span className="text-yellow-400">{room.host.rank}</span> / Lv.{room.host.level}</div>
                    </div>
                    <button 
                      onClick={() => handleJoinMatch(room.id)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold shadow text-sm"
                    >
                      挑む
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArenaView;