import React, { useState, useEffect, useRef } from 'react';
import { Skull, Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { SVGs } from '../GameSvgs';
import { MONSTER_TYPES, JOBS, CONSUMABLES } from '../../constants/data';
import { calculateEffectiveStats } from '../../utils/gameLogic';

const BattleScreen = ({ battleState, setBattleState, player, equipped, inventory, setInventory, onWin, onLose, difficulty }) => {
  const [typed, setTyped] = useState('');
  const inputRef = useRef(null);
  const [animEffect, setAnimEffect] = useState(null); 
  const [damageAnim, setDamageAnim] = useState(null); 
  // 新規追加: IME入力中かどうかのState
  const [isComposing, setIsComposing] = useState(false);

  const enemy = battleState.enemies[battleState.currentEnemyIndex];
  // 敵の画像を取得。定義がない場合はスライムをデフォルトとする
  const MonsterIll = (enemy && enemy.type && MONSTER_TYPES[enemy.type]) ? MONSTER_TYPES[enemy.type].illustration : SVGs.Slime;
  const PlayerIll = JOBS[player.job].Illustration;
  
  const eff = calculateEffectiveStats(player, equipped, battleState.buffs);

  // バトル進行のタイマー処理
  useEffect(() => {
    if (battleState.isOver) return;

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
        
        // 毒ダメージ処理
        if (prev.statusAilments.poison) {
           if (now % 2000 < 100) { 
              newPlayerHp -= Math.floor(prev.playerMaxHp * 0.05);
              if (!newLog.includes('毒によるダメージ！')) newLog.push('毒によるダメージ！');
           }
        }

        // バフ効果時間の減少
        const newBuffs = { ...prev.buffs };
        Object.keys(newBuffs).forEach(key => {
           if (newBuffs[key] > 0) newBuffs[key] = Math.max(0, newBuffs[key] - delta);
        });

        // 敵の攻撃処理
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

             // 状態異常攻撃の判定
             const typeData = MONSTER_TYPES[currentEnemy.type];
             if (typeData && typeData.actions) {
               if (typeData.actions.includes('POISON') && Math.random() < 0.3) {
                 prev.statusAilments.poison = true;
                 newLog.push('毒を受けてしまった！');
               }
               if (typeData.actions.includes('PARALYSIS') && Math.random() < 0.3) {
                 prev.statusAilments.paralysis = true;
                 newLog.push('麻痺してしまった！');
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
  }, [setBattleState, battleState.isOver, eff.battle]); 

  // ダメージアニメーション制御
  useEffect(() => {
    if (battleState.lastDamageTime > 0 && battleState.lastDamageType) {
        setDamageAnim(battleState.lastDamageType);
        const timeout = setTimeout(() => setDamageAnim(null), 500);
        return () => clearTimeout(timeout);
    }
  }, [battleState.lastDamageTime, battleState.lastDamageType]);

  // 勝敗判定
  useEffect(() => {
    if (battleState.isOver) return; 
    if (battleState.playerHp <= 0) {
        setBattleState(prev => ({ ...prev, isOver: true }));
        setTimeout(() => onLose(), 100);
        return;
    }
    if (battleState.isBossDefeated) {
        setBattleState(prev => ({ ...prev, isOver: true }));
        setTimeout(() => onWin(battleState.stage), 500);
        return;
    }
  }, [battleState.playerHp, battleState.isBossDefeated, battleState.isOver, battleState.stage, onLose, onWin, setBattleState]);

  // 入力フォーカス維持
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [battleState.currentEnemyIndex]);

  // アイテム使用処理
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

  // タイピング入力処理
  const handleInput = (e) => {
    if (battleState.isOver) return;
    
    if (battleState.statusAilments.paralysis && Math.random() < 0.3) {
       setBattleState(prev => ({ ...prev, log: [...prev.log, '麻痺して動けない！'] }));
       return;
    }

    const val = e.target.value;
    if (!/^[a-zA-Z0-9]*$/.test(val)) return;

    // 数字キーによるアイテム使用ショートカット
    const num = parseInt(val.slice(-1));
    if (!isNaN(num) && num > 0) {
       const consumables = inventory.filter(i => i.type === 'CONSUMABLE');
       if (consumables[num - 1]) {
         handleUseItem(consumables[num - 1]);
         setTyped(prev => prev); // 入力欄を更新しない（数字を残さない）
         return;
       }
    }

    if (/[0-9]/.test(val)) return;

    const targetRomaji = enemy.word.romaji;
    const currentLength = typed.length;

    if (val.length > currentLength) {
       const addedChar = val.slice(-1);
       const expectedChar = targetRomaji[currentLength];

       if (addedChar === expectedChar) {
          setTyped(val);
          if (val === targetRomaji) {
            setTyped('');
            attackEnemy();
          }
       } else {
          applyPenalty();
       }
    } else {
      // 削除キー対応などで文字が減った場合
      if (val === targetRomaji.substring(0, val.length)) {
          setTyped(val);
      }
    }
  };

  // ミスペナルティ処理
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

  // 攻撃処理
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
        currentEnemy.currentAttackGauge = Math.max(0, currentEnemy.currentAttackGauge - 300); // 攻撃成功で敵のゲージを少し減らす
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
          <div className="flex gap-4">
             {battleState.statusAilments.poison && <div className="bg-purple-100 px-3 py-1 rounded text-purple-700 animate-pulse font-bold flex items-center gap-1 border border-purple-200"><Skull size={14}/> 毒</div>}
             {battleState.statusAilments.paralysis && <div className="bg-yellow-100 px-3 py-1 rounded text-yellow-700 animate-pulse font-bold flex items-center gap-1 border border-yellow-200"><Zap size={14}/> 麻痺</div>}
             {Object.entries(battleState.buffs).map(([key, val]) => val > 0 && (
                <div key={key} className="bg-orange-100 px-3 py-1 rounded text-orange-700 font-bold flex items-center gap-1 border border-orange-200"><ArrowRight size={14} className="-rotate-45"/> {key.toUpperCase()} UP</div>
             ))}
          </div>
      </div>

      {/* 入力モードインジケーター（新規追加） */}
      <div className="absolute top-20 right-4 z-50 pointer-events-none">
        <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg border-2 transition-all ${isComposing ? 'bg-red-100 text-red-600 border-red-500 animate-pulse' : 'bg-blue-100 text-blue-600 border-blue-500'}`}>
           {isComposing ? '⚠️ 日本語入力中 (英数に切替)' : 'A 英数モード'}
        </div>
      </div>

      {/* メインバトル画面 */}
      <div className="flex-1 flex items-center justify-between px-10 relative z-10 max-w-6xl mx-auto w-full">
        {/* プレイヤー側 */}
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

        {/* 敵側 */}
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
        // CompositionイベントでIME状態を判定
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        autoFocus 
      />

      {/* アイテムショートカット */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
         {consumables.slice(0, 9).map((item, i) => (
           <button 
             key={item.id} 
             onClick={(e) => { e.stopPropagation(); handleUseItem(item); }}
             className="w-12 h-12 bg-white border-2 border-slate-300 rounded flex flex-col items-center justify-center hover:border-yellow-500 hover:scale-110 transition-all relative shadow-md"
             title={CONSUMABLES[item.consumableId].desc}
           >
             <div className="scale-75">{CONSUMABLES[item.consumableId].icon}</div>
             <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border border-slate-600">{i + 1}</div>
           </button>
         ))}
      </div>

      {/* バトルログ */}
      <div className="h-32 bg-slate-100 p-4 overflow-y-auto text-xs font-mono text-slate-600 border-t border-slate-300 z-10">
        {battleState.log.map((l, i) => <div key={i} className="border-b border-slate-200 py-1">{l}</div>)}
        <div ref={(el) => el && el.scrollIntoView({ behavior: 'smooth' })}></div>
      </div>
    </div>
  );
};

export default BattleScreen;