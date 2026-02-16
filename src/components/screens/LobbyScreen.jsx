import React, { useState, useEffect } from 'react';
import { Users, Eye, Play, ArrowLeft, Copy, User, Trash2 } from 'lucide-react';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../lib/firebase';
import { generateId } from '../../utils/gameLogic';
import { WORD_LISTS } from '../../constants/data';

const LobbyScreen = ({ player, userId, onJoinRoom, onBack, difficulty }) => {
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState('MENU');
  const [error, setError] = useState('');
  
  // ゲスト名の初期値
  const [hostName, setHostName] = useState(player?.name || '冒険者1');
  const [guestName, setGuestName] = useState(player?.name || '冒険者2');

  // 部屋の監視用
  const [unsubscribe, setUnsubscribe] = useState(null);

  useEffect(() => {
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [unsubscribe]);

  const createRoom = async () => {
    if (!hostName) {
      setError('名前を入力してください');
      return;
    }
    
    const newRoomId = generateId().substring(0, 6).toUpperCase();
    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', newRoomId);
    
    const wordList = WORD_LISTS[difficulty];
    const p1Word = wordList[Math.floor(Math.random() * wordList.length)];

    // ★修正: ゲスト対戦(ロビー)はHP100固定
    const FIXED_HP = 100;

    const roomData = {
      status: 'WAITING',
      createdAt: Date.now(),
      difficulty: difficulty,
      type: 'LOBBY',
      player1: {
        id: userId || 'guest_host',
        name: hostName,
        hp: FIXED_HP,
        maxHp: FIXED_HP,
        word: p1Word,
        race: player?.race || 'HUMAN',
        job: player?.job || 'FIGHTER',
        gender: player?.gender || 'MALE',
        ready: true
      },
      player2: null,
      logs: ['ルームが作成されました']
    };

    try {
      await setDoc(roomRef, roomData);
      setRoomId(newRoomId);
      setMode('WAITING');
      subscribeToRoom(newRoomId);
    } catch (e) {
      console.error(e);
      setError('ルーム作成に失敗しました: ' + e.message);
    }
  };

  const joinRoom = async () => {
    if (!roomId) return;
    if (!guestName) {
      setError('名前を入力してください');
      return;
    }

    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId);
    
    try {
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        setError('ルームが見つかりません');
        return;
      }
      const data = snap.data();
      if (data.status !== 'WAITING') {
        setError('このルームは既に対戦中か終了しています');
        return;
      }

      const wordList = WORD_LISTS[data.difficulty || 'NORMAL'];
      const p2Word = wordList[Math.floor(Math.random() * wordList.length)];

      // ★修正: ゲスト対戦(ロビー)はHP100固定
      const FIXED_HP = 100;

      const player2Data = {
        id: userId || 'guest_joiner',
        name: guestName,
        hp: FIXED_HP,
        maxHp: FIXED_HP,
        word: p2Word,
        race: player?.race || 'HUMAN',
        job: player?.job || 'FIGHTER',
        gender: player?.gender || 'MALE',
        ready: true
      };

      await updateDoc(roomRef, {
        player2: player2Data,
        status: 'BATTLE',
        logs: [...(data.logs || []), `${guestName} が参加しました！対戦開始！`]
      });

      onJoinRoom(roomId, 'PLAYER');
    } catch (e) {
      console.error(e);
      setError('参加に失敗しました: ' + e.message);
    }
  };

  const spectateRoom = async () => {
    if (!roomId) return;
    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      setError('ルームが見つかりません');
      return;
    }
    onJoinRoom(roomId, 'SPECTATOR');
  };

  const subscribeToRoom = (id) => {
    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', id);
    const unsub = onSnapshot(roomRef, (doc) => {
      const data = doc.data();
      if (data && data.status === 'BATTLE') {
        onJoinRoom(id, 'PLAYER');
      }
    });
    setUnsubscribe(() => unsub);
  };

  const handleCancelWait = async () => {
    if (roomId) {
      try {
        if (unsubscribe) unsubscribe();
        await deleteDoc(doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId));
      } catch (e) {
        console.error("Delete Room Error:", e);
      }
    }
    setRoomId('');
    setMode('MENU');
    setError('');
  };

  if (mode === 'WAITING') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-800 p-8">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-blue-200 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 animate-pulse">対戦相手を待っています...</h2>
          <div className="mb-6">
            <div className="text-sm text-slate-500 mb-1">ルームID (対戦相手に伝えてください)</div>
            <div className="text-4xl font-mono font-black text-slate-800 bg-slate-100 p-4 rounded border-2 border-slate-300 flex items-center justify-center gap-4">
              {roomId}
              <button onClick={() => navigator.clipboard.writeText(roomId)} className="text-slate-400 hover:text-blue-500" title="コピー"><Copy size={20}/></button>
            </div>
          </div>
          <div className="text-sm text-slate-500">あなたの名前: <span className="font-bold text-slate-800">{hostName}</span></div>
          
          <button 
            onClick={handleCancelWait} 
            className="mt-8 px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-bold flex items-center justify-center gap-2 w-full transition-colors"
          >
            <Trash2 size={18} /> キャンセルして戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-800 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-xl border border-slate-200 overflow-y-auto max-h-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600 flex items-center justify-center gap-2">
          <Users /> マルチプレイロビー
        </h2>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-1">Player 1 (ホスト)</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">対戦時の名前</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded pl-9 p-2 text-sm"
                  maxLength={10}
                />
              </div>
            </div>
            <button 
              onClick={createRoom}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold shadow-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Users size={18} /> ルームを作成
            </button>
          </div>
        </div>

        <div className="relative border-t border-slate-200 my-6">
          <span className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs text-slate-400">または</span>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-1">Player 2 (ゲスト) / 観戦</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ルームID</label>
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="IDを入力"
                className="w-full bg-white border border-slate-300 rounded p-2 text-center font-mono tracking-widest uppercase"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">対戦時の名前 (参加者のみ)</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded pl-9 p-2 text-sm"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={joinRoom}
                disabled={!roomId}
                className="flex-1 py-3 bg-green-600 disabled:bg-slate-300 text-white rounded-lg font-bold shadow-sm hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Play size={16} /> 参加
              </button>
              <button 
                onClick={spectateRoom}
                disabled={!roomId}
                className="flex-1 py-3 bg-yellow-500 disabled:bg-slate-300 text-white rounded-lg font-bold shadow-sm hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Eye size={16} /> 観戦
              </button>
            </div>
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{error}</div>}

        <button onClick={onBack} className="mt-6 w-full py-2 text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1">
          <ArrowLeft size={16}/> 戻る
        </button>
      </div>
    </div>
  );
};

export default LobbyScreen;