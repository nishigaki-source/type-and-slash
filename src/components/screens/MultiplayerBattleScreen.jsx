import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../lib/firebase';
import { WORD_LISTS, JOBS, RACE_ADVANTAGES, JOB_ADVANTAGES } from '../../constants/data';
import { Sword, LogOut, Trophy, Skull } from 'lucide-react';
import { SVGs } from '../GameSvgs';
import { calculateEffectiveStats, calculateDamageMultiplier } from '../../utils/gameLogic';

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
    } else if (type === 'COUNTDOWN') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'START') {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(1000, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
    setTimeout(() => { if(ctx.state !== 'closed') ctx.close(); }, 1000);
  } catch (e) { console.error(e); }
};

// -----------------------------------------------------------------------------
// バーチャルキーボード (JIS配列 & Shift連動)
// -----------------------------------------------------------------------------
const Keyboard = ({ activeKey }) => {
  const [isShift, setIsShift] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsShift(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShift(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const keys = [
    // Row 1
    [
      { n: '1', s: '!' }, { n: '2', s: '"' }, { n: '3', s: '#' }, { n: '4', s: '$' }, { n: '5', s: '%' },
      { n: '6', s: '&' }, { n: '7', s: "'" }, { n: '8', s: '(' }, { n: '9', s: ')' }, { n: '0', s: '' },
      { n: '-', s: '=' }, { n: '^', s: '~' }, { n: '¥', s: '|' }
    ],
    // Row 2
    [
      { n: 'q', s: 'Q' }, { n: 'w', s: 'W' }, { n: 'e', s: 'E' }, { n: 'r', s: 'R' }, { n: 't', s: 'T' },
      { n: 'y', s: 'Y' }, { n: 'u', s: 'U' }, { n: 'i', s: 'I' }, { n: 'o', s: 'O' }, { n: 'p', s: 'P' },
      { n: '@', s: '`' }, { n: '[', s: '{' }
    ],
    // Row 3
    [
      { label: 'Shift', width: 'w-14', isFunc: true },
      { n: 'a', s: 'A' }, { n: 's', s: 'S' }, { n: 'd', s: 'D' }, { n: 'f', s: 'F' }, { n: 'g', s: 'G' },
      { n: 'h', s: 'H' }, { n: 'j', s: 'J' }, { n: 'k', s: 'K' }, { n: 'l', s: 'L' }, { n: ';', s: '+' },
      { n: ':', s: '*' }, { n: ']', s: '}' }
    ],
    // Row 4
    [
      { n: 'z', s: 'Z' }, { n: 'x', s: 'X' }, { n: 'c', s: 'C' }, { n: 'v', s: 'V' }, { n: 'b', s: 'B' },
      { n: 'n', s: 'N' }, { n: 'm', s: 'M' }, { n: ',', s: '<' }, { n: '.', s: '>' }, { n: '/', s: '?' },
      { n: '\\', s: '_' }
    ]
  ];

  return (
    <div className="flex flex-col gap-1 items-center select-none pointer-events-none opacity-100 scale-75 sm:scale-100 origin-bottom transition-all duration-300">
      {keys.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((key, j) => {
            if (key.isFunc) {
               const isActive = key.label === 'Shift' && isShift;
               return (
                 <div key={j} className={`${key.width} h-8 sm:h-10 rounded flex items-center justify-center font-bold text-xs sm:text-sm bg-slate-700 text-white border-b-4 border-slate-900 ${isActive ? 'translate-y-1 border-b-0' : ''}`}>
                   {key.label}
                 </div>
               )
            }
            
            const char = isShift ? key.s : key.n;
            const isHighlight = activeKey === char;

            return (
              <div key={j} className={`w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center font-bold text-sm sm:text-base border-b-4 transition-all duration-75 shadow-sm ${isHighlight ? 'bg-blue-500 text-white border-blue-700 transform translate-y-1 shadow-[0_0_15px_#3b82f6] border-b-0' : 'bg-white text-slate-600 border-slate-300'}`}>
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
const MultiplayerBattleScreen = ({ roomId, playerRole, player, equipped, userId, onFinish }) => {
  const [roomData, setRoomData] = useState(null);
  const [typed, setTyped] = useState('');
  const [currentWord, setCurrentWord] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState(null);
  const [penaltyAnim, setPenaltyAnim] = useState(false); 
  const inputRef = useRef(null);
  
  // ★追加: カウントダウン用State (初期値3)
  const [countdown, setCountdown] = useState(3);
  
  // 統計用Ref
  const totalTypes = useRef(0);
  const totalMiss = useRef(0);

  // 装備込みの攻撃力を計算 (ない場合はSTRまたはデフォルト値)
  const eff = calculateEffectiveStats(player, equipped || {});
  const myAtk = eff ? eff.battle.atk : (player.stats?.str || 10);

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
        onFinish(null, { typeCount: totalTypes.current, missCount: totalMiss.current });
      }
    });
    return () => unsub();
  }, [roomId, onFinish]);

  // ★追加: カウントダウン処理
  useEffect(() => {
    if (roomData && (roomData.status === 'PLAYING' || roomData.status === 'BATTLE')) {
      if (countdown > 0) {
        playSound('COUNTDOWN');
        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 0) {
        // カウントダウン終了時に1回だけ鳴らす(厳密には0になった瞬間)
        // ここでは簡易的に0になったらSTART音
        // playSound('START'); // 必要に応じて
      }
    }
  }, [countdown, roomData]);

  // 初期ワード設定 & ターゲット更新
  useEffect(() => {
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

  const getPlayerData = () => {
    if (!roomData) return { myData: null, enemyData: null, isHostMode: true };

    const isHostMode = 'host' in roomData;
    let myData, enemyData, myRoleKey, enemyRoleKey;

    if (isHostMode) {
      const isHost = playerRole === 'HOST' || (roomData.host?.id === userId);
      myData = isHost ? roomData.host : roomData.guest;
      enemyData = isHost ? roomData.guest : roomData.host;
      myRoleKey = isHost ? 'host' : 'guest';
      enemyRoleKey = isHost ? 'guest' : 'host';
    } else {
      const isPlayer1 = roomData.player1?.id === userId;
      myData = isPlayer1 ? roomData.player1 : roomData.player2;
      enemyData = isPlayer1 ? roomData.player2 : roomData.player1;
      myRoleKey = isPlayer1 ? 'player1' : 'player2';
      enemyRoleKey = isPlayer1 ? 'player2' : 'player1';
    }

    return { myData, enemyData, myRoleKey, enemyRoleKey };
  };

  const { myData, enemyData, myRoleKey, enemyRoleKey } = getPlayerData();
  const isBattleActive = roomData && (roomData.status === 'PLAYING' || roomData.status === 'BATTLE');

  // ★追加: 相性状態を取得するヘルパー関数
  const getRelationStatus = (attacker, defender) => {
    if (!attacker || !defender) return null;
    
    // データの大文字小文字を吸収
    const atkRace = attacker.race ? attacker.race.toUpperCase() : '';
    const defRace = defender.race ? defender.race.toUpperCase() : '';
    const atkJob = attacker.job ? attacker.job.toUpperCase() : '';
    const defJob = defender.job ? defender.job.toUpperCase() : '';

    // 攻撃側が有利か？
    let isAdvantage = false;
    if (RACE_ADVANTAGES[atkRace]?.includes(defRace)) isAdvantage = true;
    if (JOB_ADVANTAGES[atkJob]?.includes(defJob)) isAdvantage = true;

    // 攻撃側が不利（相手が有利）か？
    let isDisadvantage = false;
    if (RACE_ADVANTAGES[defRace]?.includes(atkRace)) isDisadvantage = true;
    if (JOB_ADVANTAGES[defJob]?.includes(atkJob)) isDisadvantage = true;

    if (isAdvantage) return { text: '有利', color: 'bg-red-500' };
    if (isDisadvantage) return { text: '不利', color: 'bg-blue-500' };
    return null;
  };

  // 自分から見た相性、相手から見た相性を取得
  const myRelation = getRelationStatus(myData, enemyData);
  const enemyRelation = getRelationStatus(enemyData, myData);

  const handleInput = (e) => {
    // ★修正: カウントダウン中は入力不可
    if (!isBattleActive || !currentWord || countdown > 0) return;

    const val = e.target.value;
    if (!/^[ -~]*$/.test(val)) return;

    if (val.length > typed.length) {
       const addedChar = val.slice(-1);
       const upperChar = addedChar.toUpperCase();
       
       setHighlightedKey(upperChar);
       setTimeout(() => setHighlightedKey(null), 150);

       const targetRomaji = currentWord.romaji;
       if (typed.length >= targetRomaji.length) {
         totalMiss.current += 1; 
         playSound('MISS');
         applyPenalty(); 
         return;
       }
       
       const expectedChar = targetRomaji[typed.length];

       if (addedChar === expectedChar) {
          totalTypes.current += 1; 
          playSound('TYPE');
          setTyped(val);
          
          if (val === targetRomaji) {
            attackAction();
            changeWord();
          }
       } else {
          totalMiss.current += 1; 
          playSound('MISS');
          applyPenalty(); 
       }
    } else {
      if (val === currentWord.romaji.substring(0, val.length)) {
          setTyped(val);
      }
    }
  };

  const applyPenalty = async () => {
    if (!myData || !myRoleKey) return;

    let penaltyDamage;

    if (roomData?.type === 'LOBBY') {
        penaltyDamage = 5;
    } else {
        const ranksOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'CHAMPION'];
        let rankIndex = ranksOrder.indexOf(myData.rankId);
        
        if (rankIndex === -1) {
           const ranksName = ['ブロンズ', 'シルバー', 'ゴールド', 'プラチナ', 'ダイヤモンド', 'マスター', 'チャンピオン'];
           rankIndex = ranksName.indexOf(myData.rank);
           if (rankIndex === -1) rankIndex = 0; 
        }

        const penaltyRate = 0.10 + (rankIndex * 0.02);
        const damage = Math.floor(myData.maxHp * penaltyRate);
        penaltyDamage = Math.max(1, damage);
    }

    setPenaltyAnim(true);
    setTimeout(() => setPenaltyAnim(false), 500);

    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId);
    await updateDoc(roomRef, {
      [`${myRoleKey}.hp`]: increment(-penaltyDamage),
      logs: arrayUnion(`${myData.name}のミス！ ${penaltyDamage}の反動ダメージ！`)
    });
  };

  const attackAction = async () => {
    playSound('ATTACK');
    
    let damage;
    let effectivenessMsg = '';

    if (roomData?.type === 'LOBBY') {
        damage = 10;
    } else {
        const { multiplier, reasons } = calculateDamageMultiplier(player, enemyData);
        const baseDamage = myAtk * (1 + Math.random() * 0.2);
        damage = Math.floor(baseDamage * multiplier);
        if (reasons.length > 0) {
          effectivenessMsg = ` (${reasons.join('・')}!)`;
        }
    }
    
    const roomRef = doc(db, 'artifacts', GAME_APP_ID, 'rooms', roomId);
    
    await updateDoc(roomRef, {
      [`${enemyRoleKey}.hp`]: increment(-damage),
      logs: arrayUnion(`${player.name}の攻撃！ ${damage}ダメージ！${effectivenessMsg}`)
    });
  };

  useEffect(() => {
    if (!isBattleActive || !myData || !enemyData) return;

    if (myData.hp <= 0 || enemyData.hp <= 0) {
      const winnerId = myData.hp > 0 ? myData.id : enemyData.id;
      const winnerName = myData.hp > 0 ? myData.name : enemyData.name;
      
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
      <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* ★追加: カウントダウンオーバーレイ */}
      {countdown > 0 && isBattleActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-9xl font-black text-yellow-400 animate-ping">
            {countdown}
          </div>
        </div>
      )}

      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-2 text-yellow-400 font-bold italic">
          <Sword size={20} /> ONLINE BATTLE
        </div>
        <button 
          onClick={() => onFinish(null, { typeCount: totalTypes.current, missCount: totalMiss.current })}
          className="bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 border border-red-700"
        >
          <LogOut size={12}/> 退出
        </button>
      </div>

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
              <button 
                onClick={() => onFinish({ winner: roomData.winner }, { typeCount: totalTypes.current, missCount: totalMiss.current })}
                className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 shadow-lg transform active:scale-95 transition-all"
              >
                ロビーへ戻る
              </button>
           </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full max-w-5xl mx-auto px-4">
        
        {penaltyAnim && (
          <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
             <div className="text-red-500 text-4xl font-black animate-ping drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">MISS PENALTY!</div>
          </div>
        )}

        <div className="flex justify-between items-end w-full mb-10 px-4 sm:px-12">
          {/* プレイヤー（左） */}
          <div className="flex flex-col items-center">
            {/* ★追加: 有利・不利バッジ */}
            {myRelation && (
              <div className={`${myRelation.color} text-white text-xs font-bold px-2 py-1 rounded-full mb-2 animate-bounce shadow-md`}>
                {myRelation.text}
              </div>
            )}
            <div className="relative mb-4">
               <div className={`w-24 h-24 sm:w-32 sm:h-32 bg-blue-900/50 rounded-full border-4 ${penaltyAnim ? 'border-red-500 shake' : 'border-blue-500'} overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all`}>
                 <MyJobIll gender={player.gender} race={player.race} />
               </div>
               <div className="absolute -bottom-2 w-full text-center">
                 <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">YOU</span>
               </div>
            </div>
            <div className="w-32 sm:w-48 text-center">
               <div className="text-xs mb-1 text-slate-300 font-bold">{player.name}</div>
               <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600 relative">
                 <div className={`h-full transition-all duration-300 ${myData.hp < myData.maxHp * 0.3 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.max(0, (myData.hp / myData.maxHp) * 100)}%` }}></div>
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono shadow-sm">{myData.hp}</div>
               </div>
            </div>
          </div>

          <div className="text-4xl font-black text-slate-600 italic pb-10">VS</div>

          {/* 相手（右） */}
          <div className="flex flex-col items-center">
            {/* ★追加: 有利・不利バッジ (相手視点) */}
            {enemyRelation && (
              <div className={`${enemyRelation.color} text-white text-xs font-bold px-2 py-1 rounded-full mb-2 animate-bounce shadow-md`}>
                {enemyRelation.text}
              </div>
            )}
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

        <div className="bg-slate-800/80 backdrop-blur border-2 border-slate-600 p-6 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-lg mb-8 relative">
           <div className="text-sm text-slate-400 mb-2">{currentWord?.display}</div>
           <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest mb-2 h-12 flex items-center">
              <span className="text-blue-400">{typed}</span>
              <span className="text-slate-600">{currentWord?.romaji.substring(typed.length)}</span>
           </div>
           
           {isComposing && (
             <div className="absolute -top-12 bg-red-500/90 text-white px-4 py-2 rounded shadow-lg text-xs font-bold animate-pulse">
               ⚠️ 日本語入力になっています！ 英数モードに切り替えてください
             </div>
           )}
        </div>

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
              disabled={!isBattleActive || countdown > 0} // ★修正: カウントダウン中も無効化
           />
        </div>
      </div>

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