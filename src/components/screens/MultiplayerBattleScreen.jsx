import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../lib/firebase';
import { WORD_LISTS, JOBS } from '../../constants/data';
import { Sword, LogOut, Trophy, Skull } from 'lucide-react';
import { SVGs } from '../GameSvgs';

// -----------------------------------------------------------------------------
// 効果音再生ユーティリティ
// -----------------------------------------------------------------------------
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    
    if (type === 'TYPE') {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.1, now); 
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'MISS') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.15);
      gain.gain.setValueAtTime(0.1, now); 
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'ATTACK') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
    setTimeout(() => { if(ctx.state !== 'closed') ctx.close(); }, 1000);
  } catch (e) { console.error(e); }
};

// -----------------------------------------------------------------------------
// バーチャルキーボード
// -----------------------------------------------------------------------------
const Keyboard = ({ activeKey }) => {
  const rows = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M']
  ];
  return (
    <div className="flex flex-col gap-2 items-center select-none pointer-events-none opacity-100 scale-75 sm:scale-100 origin-bottom transition-all duration-300">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          {row.map(char => {
            const isActive = activeKey === char;
            return (
              <div key={char} className={`w-8 h-8 sm:w-12 sm:h-12 rounded flex items-center justify-center font-bold text-sm sm:text-xl border-b-4 transition-all duration-75 shadow-sm ${isActive ? 'bg-blue-500 text-white border-blue-700 transform translate-y-1 shadow-[0_0_15px_#3b82f6] border-b-0' : 'bg-white text-slate-600 border-slate-300'}`}>
                {char}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// -----------------------------------------------------------------------------
// マルチプレイバトル画面 (メイン)
// -----------------------------------------------------------------------------
const MultiplayerBattleScreen = ({ roomId, playerRole, player, userId, onFinish }) => {
  const [roomData, setRoomData] = useState(null);
  const [typed, setTyped] = useState('');
  const [currentWord, setCurrentWord] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState(null);
  const inputRef = useRef(null);
  
  // 難易度に応じた単語リストを取得
  const difficulty = roomData?.difficulty || 'NORMAL';
  const wordList = WORD_LISTS[difficulty];

  // ルーム監視
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
      } else {
        alert('ルームが解散されました');
        onFinish();
      }
    });
    return () => unsub();
  }, [roomId, onFinish]);

  // 初期ワード設定 & ターゲット更新
  useEffect(() => {
    // 既にワードがある場合でも、ワードリストが変わったら再設定（難易度同期などのため）
    if (wordList && (!currentWord || !wordList.some(w => w.romaji === currentWord.romaji))) {
      changeWord();
    }
  }, [wordList]);

  const changeWord = () => {
    if (!wordList) return;
    const newWord = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(newWord);
    setTyped('');
  };

  // データの構造を判定して自分のデータと相手のデータを取得
  const getPlayerData = () => {
    if (!roomData) return { myData: null, enemyData: null, isHostMode: true };

    // host/guest 形式か player1/player2 形式かを判定
    const isHostMode = 'host' in roomData;
    
    let myData, enemyData, myRoleKey, enemyRoleKey;

    if (isHostMode) {
      // LobbyScreenのコードに準拠 (host/guest)
      const isHost = playerRole === 'HOST' || (roomData.host?.id === userId);
      myData = isHost ? roomData.host : roomData.guest;
      enemyData = isHost ? roomData.guest : roomData.host;
      myRoleKey = isHost ? 'host' : 'guest';
      enemyRoleKey = isHost ? 'guest' : 'host';
    } else {
      // 古い形式 or 他のロビー実装 (player1/player2)
      const isPlayer1 = roomData.player1?.id === userId;
      myData = isPlayer1 ? roomData.player1 : roomData.player2;
      enemyData = isPlayer1 ? roomData.player2 : roomData.player1;
      myRoleKey = isPlayer1 ? 'player1' : 'player2';
      enemyRoleKey = isPlayer1 ? 'player2' : 'player1';
    }

    return { myData, enemyData, myRoleKey, enemyRoleKey };
  };

  const { myData, enemyData, enemyRoleKey } = getPlayerData();
  const isBattleActive = roomData && (roomData.status === 'PLAYING' || roomData.status === 'BATTLE');

  const handleInput = (e) => {
    if (!isBattleActive || !currentWord) return;

    const val = e.target.value;
    if (!/^[a-zA-Z0-9]*$/.test(val)) return;

    if (val.length > typed.length) {
       const addedChar = val.slice(-1).toUpperCase();
       setHighlightedKey(addedChar);
       setTimeout(() => setHighlightedKey(null), 150);

       const targetRomaji = currentWord.romaji;
       // 文字数超過チェック
       if (typed.length >= targetRomaji.length) {
         playSound('MISS');
         return;
       }
       
       const expectedChar = targetRomaji[typed.length].toUpperCase();

       if (addedChar === expectedChar) {
          playSound('TYPE');
          setTyped(val);
          
          if (val === targetRomaji) {
            attackAction();
            changeWord();
          }
       } else {
          playSound('MISS');
       }
    } else {
      if (val === currentWord.romaji.substring(0, val.length)) {
          setTyped(val);
      }
    }
  };

  const attackAction = async () => {
    playSound('ATTACK');
    // ダメージ計算 (基礎10 + レベル補正 + ランダム)
    const damage = 10 + Math.floor(player.level * 0.5) + Math.floor(Math.random() * 5);
    
    // Firestore更新
    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId);
    
    await updateDoc(roomRef, {
      [`${enemyRoleKey}.hp`]: increment(-damage),
      logs: arrayUnion(`${player.name}の攻撃！ ${damage}ダメージ！`)
    });
  };

  // HP監視と勝敗決定
  useEffect(() => {
    if (!isBattleActive || !myData || !enemyData) return;

    if (myData.hp <= 0 || enemyData.hp <= 0) {
      const winnerId = myData.hp > 0 ? myData.id : enemyData.id;
      const winnerName = myData.hp > 0 ? myData.name : enemyData.name;
      
      // 勝敗が決まったらステータスを更新 (重複更新防止のため、勝者が書き込むなどの制御が理想だが、ここでは簡易的に)
      // 自分が勝者、もしくはホストの場合に書き込み
      if (myData.hp > 0) {
        updateDoc(doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId), {
          status: 'FINISHED',
          winner: winnerId,
          logs: arrayUnion(`勝者: ${winnerName}！`)
        });
      }
    }
  }, [roomData, isBattleActive, myData, enemyData, roomId]);

  const keepFocus = () => { if(inputRef.current) inputRef.current.focus(); };

  if (!roomData) return <div className="h-full flex items-center justify-center bg-slate-900 text-white">Loading Arena...</div>;
  if (!enemyData) return <div className="h-full flex items-center justify-center bg-slate-900 text-white">Waiting for opponent...</div>;

  const MyJobIll = JOBS[player.job].Illustration;
  const EnemyJobIll = JOBS[enemyData.job]?.Illustration || SVGs.Slime;

  return (
    <div className="h-full bg-slate-900 text-white flex flex-col relative overflow-hidden font-sans select-none" onClick={keepFocus}>
      {/* 背景エフェクト */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* ヘッダー */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-2 text-yellow-400 font-bold italic">
          <Sword size={20} /> ONLINE BATTLE
        </div>
        <button onClick={onFinish} className="bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 border border-red-700">
          <LogOut size={12}/> 退出
        </button>
      </div>

      {/* 結果表示モーダル */}
      {roomData.status === 'FINISHED' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full text-slate-800 border-4 border-yellow-500">
              {roomData.winner === userId ? (
                 <div className="text-yellow-500 mb-4 flex justify-center animate-bounce"><Trophy size={64} /></div>
              ) : (
                 <div className="text-slate-400 mb-4 flex justify-center"><Skull size={64} /></div>
              )}
              <h2 className="text-4xl font-black mb-2">
                {roomData.winner === userId ? 'YOU WIN!' : 'YOU LOSE...'}
              </h2>
              <button onClick={onFinish} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 shadow-lg transform active:scale-95 transition-all">
                ロビーへ戻る
              </button>
           </div>
        </div>
      )}

      {/* バトルエリア */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full max-w-5xl mx-auto px-4">
        
        {/* 対戦レイアウト */}
        <div className="flex justify-between items-end w-full mb-10 px-4 sm:px-12">
          {/* プレイヤー（左） */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
               <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-900/50 rounded-full border-4 border-blue-500 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                 <MyJobIll gender={player.gender} race={player.race} />
               </div>
               <div className="absolute -bottom-2 w-full text-center">
                 <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">YOU</span>
               </div>
            </div>
            <div className="w-32 sm:w-48 text-center">
               <div className="text-xs mb-1 text-slate-300 font-bold">{player.name}</div>
               <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600 relative">
                 <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${Math.max(0, (myData.hp / myData.maxHp) * 100)}%` }}></div>
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono shadow-sm">{myData.hp}</div>
               </div>
            </div>
          </div>

          <div className="text-4xl font-black text-slate-600 italic pb-10">VS</div>

          {/* 相手（右） */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
               <div className="w-24 h-24 sm:w-32 sm:h-32 bg-red-900/50 rounded-full border-4 border-red-500 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                 <EnemyJobIll gender={enemyData.gender || 'MALE'} race={enemyData.race || 'HUMAN'} />
               </div>
               <div className="absolute -bottom-2 w-full text-center">
                 <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">ENEMY</span>
               </div>
            </div>
            <div className="w-32 sm:w-48 text-center">
               <div className="text-xs mb-1 text-slate-300 font-bold">{enemyData.name}</div>
               <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600 relative">
                 <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.max(0, (enemyData.hp / enemyData.maxHp) * 100)}%` }}></div>
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono shadow-sm">{enemyData.hp}</div>
               </div>
            </div>
          </div>
        </div>

        {/* タイピングエリア */}
        <div className="bg-slate-800/80 backdrop-blur border-2 border-slate-600 p-6 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-lg mb-8 relative">
           <div className="text-sm text-slate-400 mb-2">{currentWord?.display}</div>
           <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest mb-2 h-12 flex items-center">
              <span className="text-blue-400">{typed}</span>
              <span className="text-slate-600">{currentWord?.romaji.substring(typed.length)}</span>
           </div>
           
           {/* 入力モード警告 */}
           {isComposing && (
             <div className="absolute -top-12 bg-red-500/90 text-white px-4 py-2 rounded shadow-lg text-xs font-bold animate-pulse">
               ⚠️ 日本語入力になっています！ 英数モードに切り替えてください
             </div>
           )}
        </div>

        {/* 仮想キーボード & 入力フォーム */}
        <div className="relative w-full flex justify-center pb-24">
           <Keyboard activeKey={highlightedKey} />
           <input 
              ref={inputRef}
              type="text" 
              className="absolute inset-0 opacity-0 cursor-default" 
              value={typed}
              onChange={handleInput}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              autoFocus
              autoComplete="off"
              disabled={!isBattleActive}
           />
        </div>
      </div>

      {/* ログエリア */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-black/60 backdrop-blur-sm border-t border-slate-700 p-4 overflow-y-auto text-xs font-mono text-slate-300 z-20">
         {roomData.logs?.slice(-5).map((log, i) => (
           <div key={i} className="border-b border-slate-700/50 py-1 animate-fade-in">{log}</div>
         ))}
         <div ref={(el) => el && el.scrollIntoView({ behavior: 'smooth' })}></div>
      </div>
    </div>
  );
};

export default MultiplayerBattleScreen;