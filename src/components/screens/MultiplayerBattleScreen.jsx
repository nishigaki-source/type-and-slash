import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../lib/firebase';
import { SVGs } from '../GameSvgs';
import { JOBS, WORD_LISTS } from '../../constants/data';
import { Trophy, Skull, Eye } from 'lucide-react';

const MultiplayerBattleScreen = ({ roomId, playerRole, player, onFinish }) => {
  const [roomData, setRoomData] = useState(null);
  const [typed, setTyped] = useState('');
  const [animEffect, setAnimEffect] = useState(null);
  // 新規追加: IME入力中かどうかのState
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef(null);

  // ルーム情報のリアルタイム監視
  useEffect(() => {
    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        setRoomData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // フォーカス維持
  useEffect(() => {
    if (playerRole === 'PLAYER' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [roomData, playerRole]);

  if (!roomData) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const isPlayer1 = player && roomData.player1?.name === player.name;
  const myData = isPlayer1 ? roomData.player1 : roomData.player2;
  const enemyData = isPlayer1 ? roomData.player2 : roomData.player1;
  const isSpectator = playerRole === 'SPECTATOR';

  // 入力処理 (プレイヤーのみ)
  const handleInput = async (e) => {
    if (isSpectator || roomData.status !== 'BATTLE') return;
    if (!myData || !myData.word) return;

    const val = e.target.value;
    if (!/^[a-zA-Z0-9]*$/.test(val)) return;

    const targetRomaji = myData.word.romaji;
    const currentLength = typed.length;

    // 正誤判定
    if (val.length > currentLength) {
       const addedChar = val.slice(-1);
       const expectedChar = targetRomaji[currentLength];

       if (addedChar === expectedChar) {
          setTyped(val);
          if (val === targetRomaji) {
            setTyped('');
            await attack(myData, enemyData);
          }
       } else {
          // ミスタイプ: ペナルティとして入力をクリア
          setAnimEffect('MISS');
          setTimeout(() => setAnimEffect(null), 300);
          setTyped('');
       }
    } else {
      if (val === targetRomaji.substring(0, val.length)) {
          setTyped(val);
      }
    }
  };

  const attack = async (me, enemy) => {
    if (!enemy) return;
    
    // ダメージ計算 (簡易)
    const dmg = 15 + Math.floor(Math.random() * 10);
    const newHp = Math.max(0, enemy.hp - dmg);
    
    // 次の単語
    const wordList = WORD_LISTS[roomData.difficulty];
    const nextWord = wordList[Math.floor(Math.random() * wordList.length)];

    const updates = {
      [`${isPlayer1 ? 'player2' : 'player1'}.hp`]: newHp,
      [`${isPlayer1 ? 'player1' : 'player2'}.word`]: nextWord,
      logs: [...roomData.logs, `${me.name}の攻撃！ ${enemy.name}に${dmg}ダメージ！`]
    };

    if (newHp === 0) {
      updates.status = 'FINISHED';
      updates.winner = me.name;
      updates.logs = [...updates.logs, `勝者: ${me.name}！`];
    }

    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId);
    await updateDoc(roomRef, updates);
    
    setAnimEffect('ATTACK');
    setTimeout(() => setAnimEffect(null), 300);
  };

  // 描画ヘルパー
  const renderUnit = (unit, isMe) => {
    if (!unit) return <div className="w-32 h-32 opacity-20 bg-slate-300 rounded-full"></div>;
    const JobIll = JOBS[unit.job].Illustration;
    
    return (
      <div className={`flex flex-col items-center transition-all duration-300 ${unit.hp <= 0 ? 'grayscale opacity-50' : ''}`}>
        <div className={`w-32 h-32 bg-slate-100 rounded-full border-4 ${isMe ? 'border-blue-500' : 'border-red-500'} flex items-center justify-center shadow-lg overflow-hidden relative`}>
           <JobIll gender={unit.gender} race={unit.race} />
           {animEffect === 'ATTACK' && isMe && <div className="absolute inset-0 bg-yellow-400/30 animate-ping"></div>}
        </div>
        <div className="mt-4 text-center">
           <div className="font-bold text-lg">{unit.name}</div>
           <div className="w-40 bg-slate-200 h-3 rounded-full overflow-hidden mt-1">
              <div className="bg-green-500 h-full transition-all duration-300" style={{width: `${(unit.hp / unit.maxHp) * 100}%`}}></div>
           </div>
           <div className="text-sm font-mono text-slate-500">{unit.hp} / {unit.maxHp}</div>
        </div>
        
        {/* 単語表示エリア */}
        <div className="mt-4 bg-white/90 px-6 py-3 rounded-xl border-2 border-slate-300 min-w-[200px] shadow-sm text-center relative overflow-hidden">
           <div className="text-sm text-slate-500 mb-1">{unit.word.display}</div>
           <div className="text-2xl font-mono font-bold tracking-widest">
             {isMe && !isSpectator ? (
               <>
                 <span className="text-blue-600">{typed}</span>
                 <span className="text-slate-300">{unit.word.romaji.substring(typed.length)}</span>
               </>
             ) : (
                <span className="text-slate-400 blur-[2px]">{unit.word.romaji}</span> // 相手や観戦者には文字をぼかす
             )}
           </div>
           {isMe && !isSpectator && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-100" style={{width: `${(typed.length / unit.word.romaji.length) * 100}%`}}></div>}
        </div>
        {animEffect === 'MISS' && isMe && <div className="absolute top-0 text-red-500 font-bold animate-ping">MISS!</div>}
      </div>
    );
  };

  return (
    <div className="h-full bg-slate-100 flex flex-col relative overflow-hidden" onClick={() => inputRef.current?.focus()}>
      <SVGs.TownBg />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>

      {/* ヘッダー */}
      <div className="relative z-10 bg-white/80 p-4 flex justify-between items-center shadow-sm">
         <div className="font-bold text-slate-700 flex items-center gap-2">
            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">PvP</span>
            ROOM: {roomId}
         </div>
         {isSpectator && <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold flex items-center gap-2"><Eye size={16}/> 観戦中</div>}
         <div className="text-slate-500 text-xs font-mono">{roomData.status}</div>
      </div>

      {/* 入力モードインジケーター（新規追加） */}
      {!isSpectator && (
        <div className="absolute top-20 right-4 z-50 pointer-events-none">
          <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg border-2 transition-all ${isComposing ? 'bg-red-100 text-red-600 border-red-500 animate-pulse' : 'bg-blue-100 text-blue-600 border-blue-500'}`}>
             {isComposing ? '⚠️ 日本語入力中 (英数に切替)' : 'A 英数モード'}
          </div>
        </div>
      )}

      {/* メインバトルフィールド */}
      <div className="flex-1 flex items-center justify-around relative z-10 px-8">
         {/* Player 1 (Left) */}
         {renderUnit(roomData.player1, isPlayer1 || (!isPlayer1 && !isSpectator && false))}

         <div className="text-6xl font-black text-slate-300 italic opacity-50">VS</div>

         {/* Player 2 (Right) */}
         {renderUnit(roomData.player2, !isPlayer1 && !isSpectator)}
      </div>

      {/* 結果表示オーバーレイ */}
      {roomData.status === 'FINISHED' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
              {roomData.winner === (player?.name) ? (
                 <div className="text-yellow-500 mb-4 flex justify-center"><Trophy size={64} /></div>
              ) : (
                 <div className="text-slate-400 mb-4 flex justify-center"><Skull size={64} /></div>
              )}
              <h2 className="text-3xl font-black text-slate-800 mb-2">
                {roomData.winner === (player?.name) ? 'YOU WIN!' : (isSpectator ? `${roomData.winner} WINS!` : 'YOU LOSE...')}
              </h2>
              <p className="text-slate-500 mb-6">勝者: {roomData.winner}</p>
              <button onClick={onFinish} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500">ロビーへ戻る</button>
           </div>
        </div>
      )}

      {/* 入力欄 */}
      {!isSpectator && roomData.status === 'BATTLE' && (
        <input 
          ref={inputRef} 
          type="text" 
          className="opacity-0 absolute top-0 left-0 w-full h-full cursor-default z-20" 
          value={typed} 
          onChange={handleInput} 
          // CompositionイベントでIME状態を判定
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          autoFocus 
        />
      )}

      {/* ログ */}
      <div className="h-32 bg-slate-900/80 p-4 text-white font-mono text-xs overflow-y-auto z-10 border-t border-slate-700">
         {roomData.logs.slice(-5).map((log, i) => <div key={i} className="mb-1 opacity-80">{log}</div>)}
      </div>
    </div>
  );
};

export default MultiplayerBattleScreen;