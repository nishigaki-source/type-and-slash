import React, { useState, useEffect, useRef } from 'react';
import { Skull, Zap, ArrowRight, AlertTriangle, LogOut } from 'lucide-react';
import { SVGs } from '../GameSvgs';
import { MONSTER_TYPES, JOBS, CONSUMABLES } from '../../constants/data';
import { calculateEffectiveStats } from '../../utils/gameLogic';

// -----------------------------------------------------------------------------
// 効果音再生ユーティリティ (Web Audio API)
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
    }
    
    setTimeout(() => {
        if(ctx.state !== 'closed') ctx.close();
    }, 1000);

  } catch (e) {
    console.error("Audio Error:", e);
  }
};

// -----------------------------------------------------------------------------
// バーチャルキーボードコンポーネント (JIS配列 & Shift連動)
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

  // JIS配列ベースのキーマップ { n: 通常, s: Shift時, w: 幅(オプション) }
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
    <div className="flex flex-col gap-1 items-center select-none pointer-events-none opacity-90 scale-90 sm:scale-100 origin-bottom transition-all duration-300">
      {keys.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((key, j) => {
            // 機能キー（Shift）
            if (key.isFunc) {
               const isActive = key.label === 'Shift' && isShift;
               return (
                 <div key={j} className={`${key.width} h-10 rounded flex items-center justify-center font-bold text-xs bg-slate-700 text-white border-b-4 border-slate-900 ${isActive ? 'translate-y-1 border-b-0 shadow-inner' : ''}`}>
                   {key.label}
                 </div>
               )
            }
            
            // 通常キー
            const char = isShift ? key.s : key.n;
            // アクティブ判定: 表示文字と一致、またはShift状態を考慮したキー値と一致
            const isHighlight = activeKey === char;

            return (
              <div 
                key={j}
                className={`
                  w-8 h-10 rounded flex items-center justify-center font-bold text-sm border-b-4 transition-all duration-75 shadow-sm
                  ${isHighlight 
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
// バトル画面メインコンポーネント
// -----------------------------------------------------------------------------
const BattleScreen = ({ battleState, setBattleState, player, equipped, inventory, setInventory, onWin, onLose, onRetreat, difficulty }) => {
  const [typed, setTyped] = useState('');
  const inputRef = useRef(null);
  const [animEffect, setAnimEffect] = useState(null); 
  const [damageAnim, setDamageAnim] = useState(null); 
  const [isComposing, setIsComposing] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState(null);
  const [countdown, setCountdown] = useState(3);

  // 計測用 Refs
  const startTime = useRef(0);
  const totalTypes = useRef(0);
  const totalMiss = useRef(0);
  const missedWords = useRef({});
  const missedKeys = useRef({}); // 苦手キー記録用

  const enemy = battleState.enemies[battleState.currentEnemyIndex];
  const MonsterIll = (enemy && enemy.type && MONSTER_TYPES[enemy.type]) ? MONSTER_TYPES[enemy.type].illustration : SVGs.Slime;
  const PlayerIll = JOBS[player.job].Illustration;
  
  const eff = calculateEffectiveStats(player, equipped, battleState.buffs);

  // カウントダウン処理
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      if (startTime.current === 0) startTime.current = Date.now();
      if (inputRef.current) inputRef.current.focus();
    }
  }, [countdown]);

  // バトル進行のタイマー処理
  useEffect(() => {
    if (battleState.isOver || countdown > 0) return;

    const timer = setInterval(() => {
      setBattleState(prev => {
        if (prev.isOver) return prev;
        
        const now = Date.now();
        const delta = now - prev.lastTick;
        const currentEnemy = prev.enemies[prev.currentEnemyIndex];
        
        let newGauge = currentEnemy.currentAttackGauge + delta;
        let newPlayerHp = prev.playerHp;
        let newLog = [...prev.log];
        let damageType = null; 
        
        if (prev.statusAilments.poison) {
           if (now % 2000 < 100) { 
              newPlayerHp -= Math.floor(prev.playerMaxHp * 0.05);
              if (!newLog.includes('毒によるダメージ！')) newLog.push('毒によるダメージ！');
           }
        }

        const newBuffs = { ...prev.buffs };
        Object.keys(newBuffs).forEach(key => {
           if (newBuffs[key] > 0) newBuffs[key] = Math.max(0, newBuffs[key] - delta);
        });

        if (newGauge >= currentEnemy.attackInterval) {
          newGauge = 0;
          const isDodge = Math.random() * 100 < eff.battle.evasionRate;

          if (isDodge) {
             newLog.push(`回避！ ${currentEnemy.name}の攻撃をかわした！`);
             damageType = 'DODGE';
          } else {
             const enemyAtk = Math.max(5, prev.stage * 8 + 5);
             const rawDmg = enemyAtk - (eff.battle.def * 0.5); 
             const damage = Math.max(1, Math.floor(rawDmg * (1 + Math.random() * 0.2)));
             
             newPlayerHp -= damage;
             newLog.push(`痛い！ ${currentEnemy.name}から${damage}のダメージ！`);
             damageType = 'DAMAGE';

             const typeData = MONSTER_TYPES[currentEnemy.type];
             if (typeData && typeData.actions) {
               if (typeData.actions.includes('POISON') && Math.random() < 0.3) {
                 prev.statusAilments.poison = true;
                 newLog.push('毒を受けてしまった！');
               }
             }
          }
        }

        const newEnemies = [...prev.enemies];
        newEnemies[prev.currentEnemyIndex] = {
          ...currentEnemy,
          currentAttackGauge: newGauge
        };

        return {
          ...prev,
          playerHp: newPlayerHp,
          enemies: newEnemies,
          buffs: newBuffs,
          log: newLog.length > 5 ? newLog.slice(-5) : newLog,
          lastTick: now,
          lastDamageType: damageType,
          lastDamageTime: damageType ? now : prev.lastDamageTime
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [setBattleState, battleState.isOver, eff.battle, countdown]); 

  // ダメージアニメーション制御
  useEffect(() => {
    if (battleState.lastDamageTime > 0 && battleState.lastDamageType) {
        setDamageAnim(battleState.lastDamageType);
        const timeout = setTimeout(() => setDamageAnim(null), 500);
        return () => clearTimeout(timeout);
    }
  }, [battleState.lastDamageTime, battleState.lastDamageType]);

  // 勝敗判定 & データ送信
  useEffect(() => {
    if (battleState.isOver) return; 
    if (battleState.playerHp <= 0) {
        setBattleState(prev => ({ ...prev, isOver: true }));
        setTimeout(() => onLose(), 100);
        return;
    }
    if (battleState.isBossDefeated) {
        setBattleState(prev => ({ ...prev, isOver: true }));
        // 勝利時に計測データを送信
        const clearTime = Date.now() - startTime.current;
        setTimeout(() => onWin(battleState.stage, {
            clearTime,
            typeCount: totalTypes.current,
            missCount: totalMiss.current,
            missedWords: missedWords.current,
            missedKeys: missedKeys.current // 苦手キーデータ送信
        }), 500);
        return;
    }
  }, [battleState.playerHp, battleState.isBossDefeated, battleState.isOver, battleState.stage, onLose, onWin, setBattleState]);

  // 入力フォーカス維持
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [battleState.currentEnemyIndex]);

  const handleUseItem = (item) => {
    const data = CONSUMABLES[item.consumableId];
    if (!data) return;

    let used = false;
    let msg = '';

    if (data.effect.type === 'HEAL') {
      if (battleState.playerHp >= eff.battle.maxHp) {
        setBattleState(prev => ({ ...prev, log: [...prev.log, 'HPは満タンです！'] }));
        return;
      }
      setBattleState(prev => ({ 
        ...prev, 
        playerHp: Math.min(eff.battle.maxHp, prev.playerHp + data.effect.value)
      }));
      used = true;
      msg = `HPが${data.effect.value}回復した！`;
    } else if (data.effect.type === 'CURE') {
      const ailment = data.effect.ailment.toLowerCase();
      if (!battleState.statusAilments[ailment]) {
        setBattleState(prev => ({ ...prev, log: [...prev.log, '効果がありません！'] }));
        return;
      }
      setBattleState(prev => ({
        ...prev,
        statusAilments: { ...prev.statusAilments, [ailment]: false }
      }));
      used = true;
      msg = `${data.name}を使用！`;
    } else if (data.effect.type === 'BUFF') {
      setBattleState(prev => ({
        ...prev,
        buffs: { ...prev.buffs, [data.effect.stat]: data.effect.duration }
      }));
      used = true;
      msg = `${data.name}を使用！力がみなぎる！`;
    }

    if (used) {
      playSound('TYPE');
      setInventory(prev => {
        const idx = prev.findIndex(i => i.id === item.id);
        if (idx === -1) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      setBattleState(prev => ({ ...prev, log: [...prev.log, msg] }));
      if(inputRef.current) inputRef.current.focus();
    }
  };

  const handleInput = (e) => {
    if (battleState.isOver || countdown > 0) return;
    
    const val = e.target.value;
    // 記号も許可するように正規表現を緩和
    if (!/^[ -~]*$/.test(val)) return;

    // 数字キー
    const num = parseInt(val.slice(-1));
    if (!isNaN(num) && val.length > typed.length && /^[0-9]$/.test(val.slice(-1))) {
       setHighlightedKey(String(num));
       setTimeout(() => setHighlightedKey(null), 150);

       if (num > 0 && num <= 9) {
           // タイプすべき文字と一致する場合はアイテムショートカットを発動させない
           const targetRomaji = enemy.word.romaji;
           const expectedChar = targetRomaji[typed.length];
           
           if (String(num) !== expectedChar) {
             const consumables = inventory.filter(i => i.type === 'CONSUMABLE');
             if (consumables[num - 1]) {
               handleUseItem(consumables[num - 1]);
               return;
             }
           }
       }
    }

    if (val.length > typed.length) {
       const addedChar = val.slice(-1);
       // ハイライトは大文字小文字を区別してそのまま渡す
       setHighlightedKey(addedChar);
       setTimeout(() => setHighlightedKey(null), 150);

       const targetRomaji = enemy.word.romaji;
       const currentLength = typed.length;
       const expectedChar = targetRomaji[currentLength];

       if (addedChar === expectedChar) {
          // 正解
          totalTypes.current += 1;
          playSound('TYPE'); 
          setTyped(val);
          if (val === targetRomaji) {
            setTyped('');
            attackEnemy();
          }
       } else {
          // ミス
          totalMiss.current += 1;
          
          // 苦手ワード記録
          const w = enemy.word.display;
          missedWords.current[w] = (missedWords.current[w] || 0) + 1;

          // 苦手キー記録
          const k = expectedChar.toUpperCase();
          missedKeys.current[k] = (missedKeys.current[k] || 0) + 1;

          playSound('MISS'); 
          applyPenalty();
       }
    } else {
      if (val === targetRomaji.substring(0, val.length)) {
          setTyped(val);
      }
    }
  };

  const applyPenalty = () => {
     setAnimEffect('MISS');
     setTimeout(() => setAnimEffect(null), 300);
     setBattleState(prev => {
         const newEnemies = [...prev.enemies];
         const currentEnemy = newEnemies[prev.currentEnemyIndex];
         currentEnemy.currentAttackGauge = Math.min(currentEnemy.attackInterval, currentEnemy.currentAttackGauge + 500);
         return {
             ...prev,
             enemies: newEnemies,
             log: [...prev.log, 'ミス！ 敵の攻撃が早まった！']
         };
     });
  };

  const attackEnemy = () => {
    const isHit = Math.random() * 100 < eff.battle.hitRate;
    if (!isHit) {
        setAnimEffect('MISS_ATTACK');
        setTimeout(() => setAnimEffect(null), 500);
        setBattleState(prev => ({ ...prev, log: [...prev.log, '攻撃ミス！'] }));
        return;
    }
    const isCrit = Math.random() * 100 < eff.battle.critRate;
    const effectType = isCrit ? 'CRITICAL' : 'ATTACK';
    setAnimEffect(effectType);
    setTimeout(() => setAnimEffect(null), 300);

    let dmg = Math.floor(eff.battle.atk * (1 + Math.random() * 0.2));
    if (isCrit) dmg = Math.floor(dmg * 1.5);

    setBattleState(prev => {
        const newEnemies = [...prev.enemies];
        const currentEnemy = newEnemies[prev.currentEnemyIndex];
        currentEnemy.hp -= dmg;
        currentEnemy.currentAttackGauge = Math.max(0, currentEnemy.currentAttackGauge - 300); 
        const newLog = [...prev.log, `${enemy.name}に${dmg}のダメージ！${isCrit ? '(会心)' : ''}`];
        
        let nextIndex = prev.currentEnemyIndex;
        let isBossDefeated = false;

        if (currentEnemy.hp <= 0) {
            currentEnemy.hp = 0;
            newLog.push(`${enemy.name}を倒した！`);
            if (prev.currentEnemyIndex >= prev.enemies.length - 1) {
                isBossDefeated = true;
            } else {
                nextIndex = prev.currentEnemyIndex + 1;
            }
        }
        return {
            ...prev,
            enemies: newEnemies,
            currentEnemyIndex: nextIndex,
            log: newLog,
            lastTick: Date.now(),
            isBossDefeated: isBossDefeated
        };
    });
  };

  const keepFocus = () => { if(inputRef.current) inputRef.current.focus(); };
  const attackProgress = Math.min(100, (enemy.currentAttackGauge / enemy.attackInterval) * 100);
  const consumables = inventory.filter(i => i.type === 'CONSUMABLE');

  return (
    <div className="h-full bg-slate-50 text-slate-800 flex flex-col relative overflow-hidden" onClick={keepFocus}>
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000012_1px,transparent_1px),linear-gradient(to_bottom,#00000012_1px,transparent_1px)] bg-[size:48px_48px] animate-[slide-bg_20s_linear_infinite]"></div>
          <style>{`@keyframes slide-bg { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ヘッダー情報 */}
      <div className="relative z-10 p-4 flex justify-between items-start bg-white/50 backdrop-blur-md border-b border-slate-200">
          <div className="text-xl font-bold italic text-slate-700 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center text-sm shadow-sm">{battleState.stage}</span>
            STAGE {battleState.stage}
          </div>
          <div className="flex items-center gap-4">
             {battleState.statusAilments.poison && <div className="bg-purple-100 px-3 py-1 rounded text-purple-700 animate-pulse font-bold flex items-center gap-1 border border-purple-200"><Skull size={14}/> 毒</div>}
             {Object.entries(battleState.buffs).map(([key, val]) => val > 0 && (
                <div key={key} className="bg-orange-100 px-3 py-1 rounded text-orange-700 font-bold flex items-center gap-1 border border-orange-200"><ArrowRight size={14} className="-rotate-45"/> {key.toUpperCase()} UP</div>
             ))}
             
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 if (window.confirm('戦闘を放棄して町へ戻りますか？\n(ペナルティはありません)')) {
                   onRetreat();
                 }
               }}
               className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded shadow-md font-bold text-xs flex items-center gap-1 transition-colors"
             >
               <LogOut size={14} /> 帰還
             </button>
          </div>
      </div>

      {/* カウントダウン */}
      {countdown > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in">
          <div className="text-9xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce">
            {countdown}
          </div>
        </div>
      )}

      {/* 入力モードインジケーター */}
      <div className="absolute top-20 right-4 z-50 pointer-events-none">
        <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg border-2 transition-all ${isComposing ? 'bg-red-100 text-red-600 border-red-500 animate-pulse' : 'bg-blue-100 text-blue-600 border-blue-500'}`}>
           {isComposing ? '⚠️ 日本語入力中 (英数に切替)' : 'A 英数モード'}
        </div>
      </div>

      {/* メインバトル画面 */}
      <div className="flex-1 flex items-center justify-between px-10 relative z-10 max-w-6xl mx-auto w-full mb-32">
        <div className={`flex flex-col items-center transition-all duration-100 ${damageAnim === 'DAMAGE' ? 'translate-x-[-10px] text-red-500' : ''}`}>
            <div className="relative">
              <div className={`w-32 h-32 bg-slate-100 rounded-full border-4 border-blue-500 flex items-center justify-center shadow-lg overflow-hidden ${Object.values(battleState.buffs).some(v => v > 0) ? 'shadow-[0_0_40px_rgba(251,146,60,0.5)]' : ''}`}>
                <PlayerIll gender={player.gender} race={player.race} />
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 bg-slate-200 h-4 rounded-full border border-slate-300 overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${(battleState.playerHp / eff.battle.maxHp) * 100}%` }} />
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="font-bold text-lg text-slate-800">{player.name}</div>
              <div className="font-mono text-xl text-slate-600">{battleState.playerHp} / {eff.battle.maxHp}</div>
            </div>
            {damageAnim === 'DAMAGE' && <div className="absolute top-0 text-red-500 font-bold text-2xl animate-bounce">Hit!</div>}
            {damageAnim === 'DODGE' && <div className="absolute top-0 text-blue-500 font-bold text-2xl animate-pulse">Dodge!</div>}
        </div>

        <div className="text-4xl font-black text-slate-300 italic opacity-50">VS</div>

        <div className={`flex flex-col items-center transition-all duration-200 ${animEffect === 'ATTACK' || animEffect === 'CRITICAL' ? 'opacity-50 scale-95' : ''}`}>
            <div className="mb-2 w-48 flex items-center gap-2">
              <AlertTriangle size={16} className={attackProgress > 80 ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                <div className={`h-full transition-all duration-100 ${attackProgress > 80 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${attackProgress}%` }}></div>
              </div>
            </div>

            <div className="relative">
              <div className={`w-32 h-32 ${enemy.isBoss ? 'bg-red-100 border-red-500' : 'bg-purple-100 border-purple-500'} rounded-xl border-4 flex items-center justify-center shadow-lg transition-all overflow-hidden`}>
                <div className={`w-full h-full p-2 ${enemy.isBoss ? 'scale-125' : ''}`}>
                   <MonsterIll />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 bg-slate-200 h-4 rounded-full border border-slate-300 overflow-hidden">
                <div className="bg-red-500 h-full transition-all duration-200" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="font-bold text-lg text-slate-800">{enemy.name}</div>
              <div className="mt-4 bg-white/80 backdrop-blur px-6 py-3 rounded-xl border border-slate-200 min-w-[200px] shadow-sm">
                <div className="text-sm text-slate-500 mb-1">{enemy.word.display}</div>
                <div className="text-3xl font-mono font-bold tracking-widest">
                  <span className="text-blue-600">{typed}</span>
                  <span className="text-slate-300">{enemy.word.romaji.substring(typed.length)}</span>
                </div>
              </div>
            </div>
            {animEffect === 'ATTACK' && <div className="absolute top-10 left-10 text-6xl font-black text-yellow-500 italic animate-bounce pointer-events-none z-20 drop-shadow-md">SLASH!</div>}
            {animEffect === 'CRITICAL' && <div className="absolute top-10 left-10 text-6xl font-black text-red-600 italic animate-bounce pointer-events-none z-20 drop-shadow-md">CRITICAL!</div>}
            {animEffect === 'MISS_ATTACK' && <div className="absolute top-10 left-10 text-4xl font-black text-slate-400 italic animate-pulse pointer-events-none z-20">MISS...</div>}
            {animEffect === 'MISS' && <div className="absolute top-0 right-0 text-red-500 font-bold animate-ping">TYPE MISS!</div>}
        </div>
      </div>

      <input 
        ref={inputRef} 
        type="text" 
        className="opacity-0 absolute top-0 left-0 w-full h-full cursor-default" 
        value={typed} 
        onChange={handleInput} 
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* バーチャルキーボード */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 z-20 w-full flex justify-center">
         <Keyboard activeKey={highlightedKey} />
      </div>

      {/* アイテムショートカット */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
         {consumables.slice(0, 9).map((item, i) => {
           const itemData = CONSUMABLES[item.consumableId];
           if (!itemData) return null;
           return (
             <button 
               key={item.id} 
               onClick={(e) => { e.stopPropagation(); handleUseItem(item); }}
               className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 border-2 border-slate-300 rounded flex flex-col items-center justify-center hover:border-yellow-500 hover:scale-110 transition-all relative shadow-md"
               title={itemData.desc}
             >
               <div className="scale-75">{itemData.icon}</div>
               <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border border-slate-600">{i + 1}</div>
             </button>
           );
         })}
      </div>

      {/* バトルログ */}
      <div className="h-28 bg-slate-100 p-4 overflow-y-auto text-xs font-mono text-slate-600 border-t border-slate-300 z-10">
        {battleState.log.map((l, i) => <div key={i} className="border-b border-slate-200 py-1">{l}</div>)}
        <div ref={(el) => el && el.scrollIntoView({ behavior: 'smooth' })}></div>
      </div>
    </div>
  );
};

export default BattleScreen;