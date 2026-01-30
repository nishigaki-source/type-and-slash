import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

import { auth, db, GAME_APP_ID } from './lib/firebase';
import { JOBS, DIFFICULTY_SETTINGS, MONSTER_TYPES } from './constants/data';
import { 
  generateItem, 
  generateConsumable, 
  calcInitialStats, 
  growStats, 
  generateId, 
  calculateEffectiveStats,
  calculateScore,
  calculateCPM,
  getTodayString,
  generateRandomName,
  getTreasureChests, // 追加
  openTreasureChest // 追加
} from './utils/gameLogic';

import AuthScreen from './components/screens/AuthScreen';
import TitleScreen from './components/screens/TitleScreen';
import CharCreateScreen from './components/screens/CharCreateScreen';
import TownScreen from './components/screens/TownScreen';
import ClassChangeScreen from './components/screens/ClassChangeScreen';
import BattleScreen from './components/screens/BattleScreen';
import ResultModal from './components/ui/ResultModal';
import TreasureSelectionModal from './components/ui/TreasureSelectionModal'; // 追加
import LobbyScreen from './components/screens/LobbyScreen';
import MultiplayerBattleScreen from './components/screens/MultiplayerBattleScreen';

export default function TypingGame() {
  const [gameState, setGameState] = useState('TITLE');
  const [player, setPlayer] = useState(null);
  const [battleState, setBattleState] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({ HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null });
  const [modalMessage, setModalMessage] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [difficulty, setDifficulty] = useState('EASY');
  
  const [fbUser, setFbUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // 宝箱選択用のState
  const [treasureChests, setTreasureChests] = useState([]);
  const [tempResultData, setTempResultData] = useState(null);

  // マルチプレイ用 State
  const [multiplayerRoomId, setMultiplayerRoomId] = useState(null);
  const [multiplayerRole, setMultiplayerRole] = useState(null); 
  const [isArenaMode, setIsArenaMode] = useState(false); 

  const initAuth = async () => {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      await signInWithCustomToken(auth, __initial_auth_token);
    }
  };

  useEffect(() => {
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
      if (!user && !isGuest) {
        setPlayer(null);
        setGameState('TITLE');
      }
    });
    return () => unsubscribe();
  }, [isGuest]);

  // データロード
  useEffect(() => {
    const loadData = async () => {
      if (fbUser && !isGuest && gameState === 'INIT') {
        try {
          const docRef = doc(db, 'artifacts', GAME_APP_ID, 'users', fbUser.uid, 'saveData', 'current');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPlayer({ ...data.player, id: fbUser.uid });
            setInventory(data.inventory || []);
            setEquipped(data.equipped || { HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null });
            if (data.shopItems && data.shopItems.length > 0) {
                setShopItems(data.shopItems);
            }
            setGameState('TITLE'); 
          } else {
             setGameState('CHAR_CREATE');
          }
        } catch (e) {
          console.error("Load Error:", e);
          setGameState('TITLE');
        }
      }
    };
    
    loadData();
  }, [fbUser, isGuest, gameState]);

  // データセーブ
  useEffect(() => {
    if (player && fbUser && !isGuest) {
      const saveData = async () => {
        try {
          const data = { player, inventory, equipped, shopItems };
          const docRef = doc(db, 'artifacts', GAME_APP_ID, 'users', fbUser.uid, 'saveData', 'current');
          await setDoc(docRef, data);
        } catch (e) {
          console.error("Save Error:", e);
        }
      };
      saveData();
    }
  }, [player, inventory, equipped, shopItems, fbUser, isGuest]);

  const refreshShop = useCallback(() => {
     if(!player) return;
     const newItems = [];
     for(let i=0; i<3; i++) newItems.push(generateConsumable());
     for(let i=0; i<5; i++) newItems.push(generateItem(player.level));
     setShopItems(newItems);
  }, [player]);

  useEffect(() => {
     if(gameState === 'TOWN' && shopItems.length === 0 && player) refreshShop();
  }, [gameState, player, shopItems.length, refreshShop]);

  const handleCreateChar = (formData) => {
    const initialStats = calcInitialStats(formData.job, formData.race, formData.personality);
    const newPlayer = {
      id: fbUser?.uid,
      name: formData.name, job: formData.job, race: formData.race, gender: formData.gender, personality: formData.personality,
      level: 1, exp: 0, gold: 500, maxStage: 1, stats: initialStats,
      arenaPoints: 0,
      records: { 
        totalTypes: 0, totalMiss: 0, dungeonClears: 0, 
        arenaChallenges: 0, 
        missedWords: {}, missedKeys: {}, daily: {} 
      }
    };
    const initialWeapon = generateItem(1, formData.job);
    initialWeapon.type = 'WEAPON';
    initialWeapon.name = '初心者の' + (JOBS[formData.job].weapon);
    initialWeapon.jobReq = [formData.job];
    
    const initialPotions = [
      generateConsumable(), generateConsumable(), generateConsumable()
    ].map(p => ({ ...p, consumableId: 'POTION_S', name: 'ポーション' }));

    setPlayer(newPlayer);
    setInventory([initialWeapon, ...initialPotions]);
    setEquipped(prev => ({ ...prev, WEAPON: initialWeapon }));
    
    setGameState('TOWN');
  };

  const handleGuestStart = async () => {
     try {
       // 未ログインなら匿名ログイン
       if (!auth.currentUser) {
         await signInAnonymously(auth);
       }
       setIsGuest(true);
       setPlayer(null); 
       setShowAuth(false);
       setGameState('CHAR_CREATE'); 
     } catch (e) {
       console.error("Guest Login Error:", e);
       alert("ゲストログインに失敗しました");
     }
  };

  const handleGuestMultiplayer = async () => {
    try {
      let currentUid = auth.currentUser?.uid;
      
      // 未ログインなら匿名ログイン
      if (!currentUid) {
        const cred = await signInAnonymously(auth);
        currentUid = cred.user.uid;
      }

      setIsGuest(true);
      const guestPlayer = {
        id: currentUid, 
        name: 'ゲスト' + generateId().substring(0,3),
        job: 'FIGHTER', race: 'HUMAN', gender: 'MALE',
        level: 10,
        stats: calcInitialStats('FIGHTER', 'HUMAN', 'BRAVE'),
        gold: 0, maxStage: 1,
        records: { totalTypes: 0, totalMiss: 0, dungeonClears: 0, arenaChallenges: 0, missedWords: {}, missedKeys: {}, daily: {} }
      };
      setPlayer(guestPlayer);
      setInventory([]);
      setEquipped({});
      setGameState('LOBBY');
    } catch (e) {
      console.error("Guest Multiplayer Error:", e);
      alert("通信エラーが発生しました");
    }
  };
  
  const handleChangeClass = (newJobId, cost) => {
    if (!player) return;
    const newGold = player.gold - cost;
    const newEquipped = { ...equipped, WEAPON: null };
    let newStats = calcInitialStats(newJobId, player.race, player.personality);
    const levelsToGrow = player.level - 1;
    if (levelsToGrow > 0) {
      const growthResult = growStats(newStats, newJobId, levelsToGrow);
      newStats = growthResult.newStats;
    }
    const newPlayer = { ...player, job: newJobId, gold: newGold, stats: newStats };
    setPlayer(newPlayer);
    setEquipped(newEquipped);
    setGameState('TOWN');
    alert(`${JOBS[newJobId].name} に転職しました！\nステータスが再計算されました。`);
  };

  const startBattle = (stage) => {
    refreshShop();
    const eff = calculateEffectiveStats(player, equipped);
    
    // 現在の難易度設定を取得
    const difficultyData = DIFFICULTY_SETTINGS[difficulty];
    
    // 現在の階層がどのゾーンに該当するか検索
    // 該当なし（上限突破時など）は最後のゾーンを使用
    const currentZone = difficultyData.zones.find(z => stage >= z.range[0] && stage <= z.range[1]) 
                        || difficultyData.zones[difficultyData.zones.length - 1];

    const enemies = [];
    const normalTypes = ['SLIME', 'BAT', 'GOBLIN', 'WOLF', 'SKELETON'];
    const bossTypes = ['DRAGON', 'DEMON'];

    // 1〜9匹目 (ザコ敵)
    for (let i = 0; i < 9; i++) {
      // ゾーンごとのザコ敵リストから抽選
      const word = currentZone.zako[Math.floor(Math.random() * currentZone.zako.length)];
      
      const typeKey = normalTypes[Math.floor(Math.random() * normalTypes.length)];
      const typeData = MONSTER_TYPES[typeKey];
      const baseHp = eff.battle.atk * 0.8 * typeData.hpMod; 
      const enemyHp = Math.floor(baseHp * (1 + stage * 0.2));
      
      enemies.push({
        id: generateId(),
        name: `${typeData.name} Lv.${stage}`,
        type: typeKey,
        hp: Math.max(1, enemyHp), maxHp: Math.max(1, enemyHp),
        word: word, isBoss: false,
        attackInterval: Math.max(2000, 6000 - (stage * 200)), 
        currentAttackGauge: 0
      });
    }
    
    // 10匹目 (フロアボス)
    // ゾーンごとのボスリストから抽選
    const bossWord = currentZone.boss[Math.floor(Math.random() * currentZone.boss.length)];
    
    const bossTypeKey = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    const bossData = MONSTER_TYPES[bossTypeKey];
    const bossHp = Math.floor(eff.battle.atk * 4 * (1 + stage * 0.3));

    enemies.push({
      id: generateId(),
      name: `BOSS: ${bossData.name} Lv.${stage}`,
      type: bossTypeKey,
      hp: bossHp, maxHp: bossHp,
      word: bossWord, isBoss: true,
      attackInterval: Math.max(1500, 4000 - (stage * 150)),
      currentAttackGauge: 0
    });

    setBattleState({
      stage: stage, 
      zoneName: currentZone.name, // ゾーン名をStateに追加（UI表示用）
      enemies: enemies, currentEnemyIndex: 0,
      playerHp: eff.battle.maxHp, playerMaxHp: eff.battle.maxHp,
      log: [`${currentZone.name} (B${stage}F) に到達した！`], // ログにもゾーン名を表示
      isOver: false, lastTick: Date.now(),
      isBossDefeated: false, lastDamageType: null, lastDamageTime: 0,
      statusAilments: { poison: false, paralysis: false },
      buffs: { str: 0, vit: 0, agi: 0, dex: 0 }
    });
    setGameState('BATTLE');
  };

  const handleEquip = (item) => {
    const slot = item.type === 'WEAPON' ? 'WEAPON' : item.type;
    setEquipped(prev => ({ ...prev, [slot]: item }));
  };

  const handleUnequip = (slot) => {
    setEquipped(prev => ({ ...prev, [slot]: null }));
  };

  // 1. バトル勝利時の処理（一時データ作成・宝箱生成）
  const handleWin = (stage, resultData = {}) => {
    const { clearTime = 0, typeCount = 0, missCount = 0, missedWords = {}, missedKeys = {} } = resultData;
    const score = calculateScore(stage, clearTime, missCount);
    const cpm = calculateCPM(typeCount, clearTime);
    const gold = stage * 100 + Math.floor(Math.random() * 50);
    
    // ★確定で入手する道具（消耗品）
    const fixedConsumable = generateConsumable();
    
    // ★3つの宝箱を生成
    const chests = getTreasureChests();

    // 宝箱選択画面へ移行するためのデータ保持
    setTempResultData({
      stage,
      gold,
      score,
      cpm,
      missCount,
      clearTime,
      missedWords,
      missedKeys,
      fixedConsumable,
      chests
    });
    
    setTreasureChests(chests);
    setGameState('TREASURE'); // 宝箱選択画面へ
  };

  // 2. 宝箱選択後の処理（装備品確定・最終リザルトへ）
  const handleChestSelect = (selectedChest) => {
    if (!tempResultData) return;

    // 選ばれた宝箱から装備品を生成
    const equipment = openTreasureChest(selectedChest, player.level, player.job);
    
    const { stage, gold, fixedConsumable, missedWords, missedKeys, clearTime, typeCount, missCount } = tempResultData;
    
    let newPlayer = { ...player };
    newPlayer.gold += gold;
    newPlayer.exp += stage * 50;
    
    if (!newPlayer.records) newPlayer.records = { totalTypes: 0, totalMiss: 0, dungeonClears: 0, arenaChallenges: 0, missedWords: {}, missedKeys: {}, daily: {} };
    newPlayer.records.totalTypes += (typeCount || 0); // resultDataから渡ってきていない場合は0
    newPlayer.records.totalMiss += missCount;
    newPlayer.records.dungeonClears += 1;
    
    Object.entries(missedWords).forEach(([word, count]) => {
      newPlayer.records.missedWords[word] = (newPlayer.records.missedWords[word] || 0) + count;
    });
    if (!newPlayer.records.missedKeys) newPlayer.records.missedKeys = {};
    Object.entries(missedKeys).forEach(([key, count]) => {
      newPlayer.records.missedKeys[key] = (newPlayer.records.missedKeys[key] || 0) + count;
    });
    
    const today = getTodayString();
    if (!newPlayer.records.daily[today]) newPlayer.records.daily[today] = { clears: 0, arenaChallenges: 0, types: 0, time: 0 };
    newPlayer.records.daily[today].clears += 1;
    newPlayer.records.daily[today].types += (typeCount || 0);
    newPlayer.records.daily[today].time += clearTime;

    const reqExp = newPlayer.level * 100;
    let levelUpInfo = null;
    if (newPlayer.exp >= reqExp) {
      const oldLv = newPlayer.level;
      newPlayer.level += 1;
      newPlayer.exp = newPlayer.exp - reqExp;
      const growthResult = growStats(newPlayer.stats, newPlayer.job, 1);
      newPlayer.stats = growthResult.newStats;
      levelUpInfo = { oldLv, newLv: newPlayer.level, gains: growthResult.gains };
    }
    if (stage === newPlayer.maxStage) newPlayer.maxStage += 1;
    
    setPlayer(newPlayer);
    
    // ★道具と装備の両方をインベントリに追加
    setInventory(prev => [...prev, fixedConsumable, equipment]);
    
    setModalMessage({ 
      type: 'WIN', 
      title: 'STAGE CLEAR!', 
      gold, 
      items: [fixedConsumable, equipment], // ★複数アイテム表示に対応
      levelUpInfo, 
      scoreInfo: { score: tempResultData.score, cpm: tempResultData.cpm, missCount, clearTime } 
    });
    
    setGameState('RESULT');
    setTempResultData(null); // クリア
  };

  const handleLose = () => {
    setModalMessage({ type: 'LOSE', title: 'GAME OVER...' });
    setGameState('RESULT');
  };

  const handleRetreat = () => setGameState('TOWN');

  const handleLogout = async () => {
     await signOut(auth);
     setPlayer(null);
     setIsGuest(false);
     setGameState('TITLE'); 
     setShowAuth(false);
  };

  const handleAuthSuccess = () => {
     setIsGuest(false);
     setShowAuth(false);
     setGameState('INIT'); 
  };

  const handleJoinRoom = (roomId, role, isArena = false) => {
    setMultiplayerRoomId(roomId);
    setMultiplayerRole(role);
    setIsArenaMode(isArena);
    setGameState('MULTI_BATTLE');
  };

  const handleStartArena = (roomId, role) => {
    handleJoinRoom(roomId, role, true);
  };

  const handleMultiFinish = (result, stats) => {
    let newPlayer = { ...player };
    
    if (stats) {
      if (!newPlayer.records) newPlayer.records = { totalTypes: 0, totalMiss: 0, dungeonClears: 0, arenaChallenges: 0, missedWords: {}, missedKeys: {}, daily: {} };
      newPlayer.records.totalTypes = (newPlayer.records.totalTypes || 0) + stats.typeCount;
      newPlayer.records.totalMiss = (newPlayer.records.totalMiss || 0) + stats.missCount;
      const today = getTodayString();
      if (!newPlayer.records.daily[today]) newPlayer.records.daily[today] = { clears: 0, arenaChallenges: 0, types: 0, time: 0 };
      newPlayer.records.daily[today].types += stats.typeCount;
      
      if (isArenaMode && result) {
        newPlayer.records.arenaChallenges = (newPlayer.records.arenaChallenges || 0) + 1;
        newPlayer.records.daily[today].arenaChallenges = (newPlayer.records.daily[today].arenaChallenges || 0) + 1;
      }
    }

    if (isArenaMode && result && !isGuest) {
      const isWinner = result.winner === player.id;
      let pointChange = 0;
      if (isWinner) pointChange = 100;
      else pointChange = -50;

      const newPoints = Math.max(0, (newPlayer.arenaPoints || 0) + pointChange);
      newPlayer.arenaPoints = newPoints;
      
      alert(isWinner 
        ? `勝利！ ランクポイント +${pointChange} (現在: ${newPoints})` 
        : `敗北... ランクポイント ${pointChange} (現在: ${newPoints})`
      );
    }
    
    setPlayer(newPlayer);
    setGameState(isArenaMode ? 'TOWN' : 'LOBBY');
  };

  if (showAuth) {
    return <AuthScreen onLogin={handleAuthSuccess} onGuest={handleGuestStart} onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="w-full h-screen bg-slate-50 overflow-hidden font-sans select-none relative">
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>
      
      {gameState === 'TITLE' && 
        <TitleScreen 
          player={player} 
          onStartNew={() => setShowAuth(true)} 
          onResume={() => setGameState('TOWN')} 
          difficulty={difficulty} 
          setDifficulty={setDifficulty}
          onShowAuth={() => setShowAuth(true)}
          onMultiplayer={() => setGameState('LOBBY')} 
          onGuestMultiplayer={handleGuestMultiplayer} 
          onDelete={async () => {
             if(window.confirm('本当にデータを削除しますか？（復元できません）')) {
                if (fbUser) {
                   try {
                     const docRef = doc(db, 'artifacts', GAME_APP_ID, 'users', fbUser.uid, 'saveData', 'current');
                     await deleteDoc(docRef);
                     setPlayer(null);
                     setInventory([]);
                     setEquipped({});
                     alert("データを削除しました。");
                   } catch (e) {
                     console.error("Delete Error:", e);
                   }
                } else {
                   setPlayer(null);
                }
             }
          }}
        />
      }
      {gameState === 'CHAR_CREATE' && <CharCreateScreen onCreate={handleCreateChar} onBack={handleLogout} />}
      
      {gameState === 'TOWN' && player && 
        <TownScreen 
          player={player} 
          inventory={inventory} 
          equipped={equipped} 
          shopItems={shopItems}
          setShopItems={setShopItems}
          setPlayer={setPlayer}
          setInventory={setInventory}
          onEquip={handleEquip} 
          onUnequip={handleUnequip} 
          onStartBattle={startBattle} 
          onLogout={handleLogout} 
          onClassChange={() => setGameState('CLASS_CHANGE')} 
          difficulty={difficulty} 
          onStartArena={handleStartArena} 
          isGuest={isGuest} 
        />
      }
      
      {gameState === 'CLASS_CHANGE' && player && <ClassChangeScreen player={player} onChangeClass={handleChangeClass} onBack={() => setGameState('TOWN')} />}
      
      {gameState === 'BATTLE' && battleState && player && 
        <BattleScreen 
          battleState={battleState} 
          setBattleState={setBattleState} 
          player={player} 
          equipped={equipped} 
          inventory={inventory} 
          setInventory={setInventory} 
          onWin={handleWin} 
          onLose={handleLose} 
          onRetreat={handleRetreat}
          difficulty={difficulty} 
        />
      }

      {/* ★宝箱選択画面 */}
      {gameState === 'TREASURE' && (
        <TreasureSelectionModal 
          chests={treasureChests}
          onSelect={handleChestSelect}
        />
      )}
      
      {gameState === 'LOBBY' && player && (
        <LobbyScreen 
          player={player}
          equipped={equipped}
          userId={player.id || fbUser?.uid} 
          difficulty={difficulty}
          onJoinRoom={(id, role) => handleJoinRoom(id, role, false)}
          onBack={() => {
            if (isGuest) {
              setPlayer(null);
              setIsGuest(false);
              setInventory([]);
              setEquipped({});
              setGameState('TITLE');
            } else {
              setGameState('TOWN');
            }
          }}
        />
      )}

      {gameState === 'MULTI_BATTLE' && player && multiplayerRoomId && (
        <MultiplayerBattleScreen 
          roomId={multiplayerRoomId}
          playerRole={multiplayerRole}
          player={player}
          equipped={equipped}
          userId={player.id || fbUser?.uid} 
          onFinish={handleMultiFinish} 
        />
      )}

      {gameState === 'RESULT' && <ResultModal message={modalMessage} onTown={() => { setModalMessage(null); setGameState('TOWN'); }} />}
    </div>
  );
}