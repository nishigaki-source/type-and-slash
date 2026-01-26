import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../lib/firebase';
import { WORD_LISTS, JOBS, RACES } from '../../constants/data';
import { Skull, Zap, LogOut, Sword, Shield } from 'lucide-react';

// -----------------------------------------------------------------------------
// 効果音再生ユーティリティ (Web Audio API) - BattleScreenと共通
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
      osc.type = 'sine';
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
    
    setTimeout(() => {
        if(ctx.state !== 'closed') ctx.close();
    }, 1000);

  } catch (e) {
    console.error("Audio Error:", e);
  }
};

// -----------------------------------------------------------------------------
// バーチャルキーボードコンポーネント
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
              <div 
                key={char}
                className={`
                  w-8 h-8 sm:w-12 sm:h-12 rounded flex items-center justify-center font-bold text-sm sm:text-xl border-b-4 transition-all duration-75 shadow-sm
                  ${isActive 
                    ? 'bg-blue-500 text-white border-blue-700 transform translate-y-1 shadow-[0_0_15px_#3b82f6] border-b-0' 
                    : 'bg-white text-slate-600 border-slate-300'}
                `}
              >
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
// マルチプレイバトル画面
// -----------------------------------------------------------------------------
const MultiplayerBattleScreen = ({ roomId, playerRole, player, userId, onFinish }) => {
  const [roomData, setRoomData] = useState(null);
  const [typed, setTyped] = useState('');
  const [currentWord, setCurrentWord] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState(null);
  const [myGauge, setMyGauge] = useState(0); // 攻撃ゲージ (0-100)
  const inputRef = useRef(null);
  const wordList = WORD_LISTS['NORMAL']; // マルチはNORMAL固定などルール決め

  // ルーム監視
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRoomData(data);
        
        // 勝敗判定
        if (data.status === 'FINISHED') {
          setTimeout(() => {
            alert(data.winner === userId ? 'YOU WIN!' : 'YOU LOSE...');
            onFinish();
          }, 1000);
        }
      } else {
        alert('ルームが解散されました');
        onFinish();
      }
    });
    return () => unsub();
  }, [roomId, userId, onFinish]);

  // 初期ワード設定 & ターゲット更新
  useEffect(() => {
    if (!currentWord) {
      changeWord();
    }
  }, []);

  const changeWord = () => {
    const newWord = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(newWord);
    setTyped('');
  };

  // 入力処理
  const handleInput = (e) => {
    if (!roomData || roomData.status !== 'PLAYING') return;

    const val = e.target.value;
    if (!/^[a-zA-Z0-9]*$/.test(val)) return;

    if (val.length > typed.length) {
       const addedChar = val.slice(-1).toUpperCase();
       setHighlightedKey(addedChar);
       setTimeout(() => setHighlightedKey(null), 150);

       const targetRomaji = currentWord.romaji;
       const expectedChar = targetRomaji[typed.length].toUpperCase();

       if (addedChar === expectedChar) {
          // 正解
          playSound('TYPE');
          setTyped(val);
          
          // ワード完成
          if (val === targetRomaji) {
            attackAction();
            changeWord();
          }
       } else {
          // ミス
          playSound('MISS');
       }
    } else {
      // Backspace等の処理（今回は単純化のため、減る場合はそのまま反映）
      if (val === currentWord.romaji.substring(0, val.length)) {
          setTyped(val);
      }
    }
  };

  // 攻撃処理
  const attackAction = async () => {
    playSound('ATTACK');
    setMyGauge(prev => {
      const next = Math.min(100, prev + 20); // 1ワードで20%チャージ
      return next;
    });

    // ダメージ計算（簡易）
    const damage = Math.floor(Math.random() * 10) + 10;
    
    // 相手へダメージ送信
    const opponentRole = playerRole === 'HOST' ? 'GUEST' : 'HOST';
    // Firestore更新
    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId);
    
    // ここでは楽観的にUI更新せず、Firestoreの変更を待つのが基本だが
    // 演出のため、自分の攻撃ログを追加する処理を入れても良い
    await updateDoc(roomRef, {
      [`${opponentRole}.hp`]: increment(-damage),
      logs: arrayUnion(`${player.name}の攻撃！ ${damage}ダメージ！`)
    });
  };

  const keepFocus = () => { if(inputRef.current) inputRef.current.focus(); };

  if (!roomData) return <div className="h-full flex items-center justify-center bg-slate-900 text-white">Loading Arena...</div>;

  const myData = playerRole === 'HOST' ? roomData.host : roomData.guest;
  const enemyData = playerRole === 'HOST' ? roomData.guest : roomData.host;
  
  // 相手がいない、または準備中の場合
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

      {/* バトルエリア */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full max-w-5xl mx-auto px-4">
        
        {/* 対戦レイアウト */}
        <div className="flex justify-between items-end w-full mb-10 px-8">
          
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
            <div className="w-40 sm:w-56">
               <div className="flex justify-between text-xs mb-1 text-slate-300">
                 <span>{player.name}</span>
                 <span className="font-mono">{myData.hp} HP</span>
               </div>
               <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                 <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${Math.max(0, (myData.hp / myData.maxHp) * 100)}%` }}></div>
               </div>
            </div>
          </div>

          <div className="text-4xl font-black text-slate-600 italic pb-10">VS</div>

          {/* 相手（右） */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
               <div className="w-24 h-24 sm:w-32 sm:h-32 bg-red-900/50 rounded-full border-4 border-red-500 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                 {/* 相手の見た目はデータ同期が必要だが簡易的にジョブで表示 */}
                 <EnemyJobIll gender={enemyData.gender || 'MALE'} race={enemyData.race || 'HUMAN'} />
               </div>
               <div className="absolute -bottom-2 w-full text-center">
                 <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">ENEMY</span>
               </div>
            </div>
            <div className="w-40 sm:w-56">
               <div className="flex justify-between text-xs mb-1 text-slate-300">
                 <span>{enemyData.name}</span>
                 <span className="font-mono">{enemyData.hp} HP</span>
               </div>
               <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                 <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.max(0, (enemyData.hp / enemyData.maxHp) * 100)}%` }}></div>
               </div>
            </div>
          </div>

        </div>

        {/* タイピングエリア */}
        <div className="bg-slate-800/80 backdrop-blur border-2 border-slate-600 p-6 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-lg mb-8 relative">
           <div className="text-sm text-slate-400 mb-2">{currentWord?.display}</div>
           <div className="text-4xl font-mono font-bold tracking-widest mb-4">
              <span className="text-blue-400">{typed}</span>
              <span className="text-slate-600">{currentWord?.romaji.substring(typed.length)}</span>
           </div>
           
           {/* 入力モード警告 */}
           {isComposing && (
             <div className="absolute -top-12 bg-red-500/90 text-white px-4 py-1 rounded text-xs font-bold animate-pulse">
               日本語入力になっています！ 英数モードに切り替えてください
             </div>
           )}
        </div>

        {/* 仮想キーボード & 入力フォーム */}
        <div className="relative w-full flex justify-center pb-20">
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
           />
        </div>

      </div>

      {/* ログエリア */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-black/60 backdrop-blur-sm border-t border-slate-700 p-4 overflow-y-auto text-xs font-mono text-slate-300 z-20">
         {roomData.logs?.slice(-5).map((log, i) => (
           <div key={i} className="border-b border-slate-700/50 py-1">{log}</div>
         ))}
      </div>
    </div>
  );
};

export default MultiplayerBattleScreen;