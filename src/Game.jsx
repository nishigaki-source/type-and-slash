import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// 作成したモジュールをインポート
import { auth, db, GAME_APP_ID } from './lib/firebase';
import { JOBS, WORD_LISTS, MONSTER_TYPES } from './constants/data';
import { 
  generateItem, 
  generateConsumable, 
  calcInitialStats, 
  growStats, 
  generateId, 
  calculateEffectiveStats,
  calculateScore,
  calculateCPM,
  getTodayString
} from './utils/gameLogic';

// 分割したコンポーネントをインポート
import AuthScreen from './components/screens/AuthScreen';
import TitleScreen from './components/screens/TitleScreen';
import CharCreateScreen from './components/screens/CharCreateScreen';
import TownScreen from './components/screens/TownScreen';
import ClassChangeScreen from './components/screens/ClassChangeScreen';
import BattleScreen from './components/screens/BattleScreen';
import ResultModal from './components/ui/ResultModal';
import LobbyScreen from './components/screens/LobbyScreen';
import MultiplayerBattleScreen from './components/screens/MultiplayerBattleScreen';

export default function TypingGame() {
  const [gameState, setGameState] = useState('INIT');
  const [player, setPlayer] = useState(null);
  const [battleState, setBattleState] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({ HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null });
  const [modalMessage, setModalMessage] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [difficulty, setDifficulty] = useState('EASY');
  
  // Firebase Auth State
  const [fbUser, setFbUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // マルチプレイ用 State
  const [multiplayerRoomId, setMultiplayerRoomId] = useState(null);
  const [multiplayerRole, setMultiplayerRole] = useState(null); // 'PLAYER' | 'SPECTATOR'

  const initAuth = async () => {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }
  };

  useEffect(() => {
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
    });
    return () => unsubscribe();
  }, []);

  // データロード (ユーザー変更時)
  useEffect(() => {
    const loadData = async () => {
      if (fbUser && !isGuest) {
        try {
          const docRef = doc(db, 'artifacts', GAME_APP_ID, 'users', fbUser.uid, 'saveData', 'current');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPlayer(data.player);
            setInventory(data.inventory || []);
            setEquipped(data.equipped || { HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null });
            // ロード時にショップアイテムがあれば復元、なければ後で生成
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
      } else if (isGuest) {
        setGameState('CHAR_CREATE');
      }
    };
    if (gameState === 'INIT' && (fbUser || isGuest)) {
      loadData();
    }
  }, [fbUser, isGuest, gameState]);

  // データセーブ (状態変化時)
  useEffect(() => {
    if (player && fbUser && !isGuest) {
      const saveData = async () => {
        try {
          // shopItems もセーブデータに含めるように修正
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

  // ショップ更新関数
  const refreshShop = useCallback(() => {
     if(!player) return;
     const newItems = [];
     // 消耗品を3つ生成
     for(let i=0; i<3; i++) {
        newItems.push(generateConsumable());
     }
     // 装備品を5つ生成
     for(let i=0; i<5; i++) {
        newItems.push(generateItem(player.level));
     }
     setShopItems(newItems);
  }, [player]);

  // 初回タウン遷移時にショップが空なら商品を生成
  useEffect(() => {
     if(gameState === 'TOWN' && shopItems.length === 0 && player) {
         refreshShop();
     }
  }, [gameState, player, shopItems.length, refreshShop]);

  const handleCreateChar = (formData) => {
    const initialStats = calcInitialStats(formData.job, formData.race, formData.personality);
    const newPlayer = {
      name: formData.name, job: formData.job, race: formData.race, gender: formData.gender, personality: formData.personality,
      level: 1, exp: 0, gold: 500, maxStage: 1, stats: initialStats,
      // 実績データの初期化
      records: {
        totalTypes: 0,
        totalMiss: 0,
        dungeonClears: 0,
        missedWords: {},
        missedKeys: {}, 
        daily: {}
      }
    };
    const initialWeapon = generateItem(1, formData.job);
    initialWeapon.type = 'WEAPON';
    initialWeapon.name = '初心者の' + (JOBS[formData.job].weapon);
    initialWeapon.jobReq = [formData.job]; // 職制限
    
    const initialPotions = [
      generateConsumable(), generateConsumable(), generateConsumable()
    ].map(p => ({ ...p, consumableId: 'POTION_S', name: 'ポーション' }));

    setPlayer(newPlayer);
    setInventory([initialWeapon, ...initialPotions]);
    setEquipped(prev => ({ ...prev, WEAPON: initialWeapon }));
    
    setGameState('TOWN');
  };
  
  // ★修正箇所: 転職時に武器を増殖させない
  const handleChangeClass = (newJobId, cost) => {
    if (!player) return;
    
    // 1. コスト支払い
    const newGold = player.gold - cost;
    
    // 2. 武器を外す (インベントリには既に存在するため、equippedステートをnullにするだけで良い)
    const newEquipped = { ...equipped, WEAPON: null };

    // 3. ステータス再計算
    let newStats = calcInitialStats(newJobId, player.race, player.personality);
    const levelsToGrow = player.level - 1;
    if (levelsToGrow > 0) {
      const growthResult = growStats(newStats, newJobId, levelsToGrow);
      newStats = growthResult.newStats;
    }

    // 4. プレイヤー情報更新
    const newPlayer = { ...player, job: newJobId, gold: newGold, stats: newStats };
    setPlayer(newPlayer);
    setEquipped(newEquipped);
    // setInventory(newInventory); // インベントリの変更は不要
    setGameState('TOWN');
    alert(`${JOBS[newJobId].name} に転職しました！\nステータスが再計算されました。`);
  };

  const startBattle = (stage) => {
    // 戦闘開始時にショップの商品を更新する
    refreshShop();

    const eff = calculateEffectiveStats(player, equipped);
    const wordList = WORD_LISTS[difficulty];
    const enemies = [];
    const normalTypes = ['SLIME', 'BAT', 'GOBLIN', 'WOLF', 'SKELETON'];
    const bossTypes = ['DRAGON', 'DEMON'];

    for (let i = 0; i < 9; i++) {
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const typeKey = normalTypes[Math.floor(Math.random() * normalTypes.length)];
      const typeData = MONSTER_TYPES[typeKey];
      const baseHp = eff.battle.atk * 0.8 * typeData.hpMod; 
      const enemyHp = Math.floor(baseHp * (1 + stage * 0.2));
      enemies.push({
        id: generateId(),
        name: `${typeData.name} Lv.${stage}`,
        type: typeKey,
        hp: Math.max(1, enemyHp),
        maxHp: Math.max(1, enemyHp),
        word: word,
        isBoss: false,
        attackInterval: Math.max(2000, 6000 - (stage * 200)), 
        currentAttackGauge: 0
      });
    }
    
    const bossWord = difficulty === 'EASY' 
      ? { display: 'ぼす', romaji: 'bosu' }
      : { display: 'ボスモンスター', romaji: 'bosumonsuta' };
    const bossTypeKey = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    const bossData = MONSTER_TYPES[bossTypeKey];
    const bossHp = Math.floor(eff.battle.atk * 4 * (1 + stage * 0.3));

    enemies.push({
      id: generateId(),
      name: `BOSS: ${bossData.name} Lv.${stage}`,
      type: bossTypeKey,
      hp: bossHp,
      maxHp: bossHp,
      word: bossWord,
      isBoss: true,
      attackInterval: Math.max(1500, 4000 - (stage * 150)),
      currentAttackGauge: 0
    });

    setBattleState({
      stage: stage,
      enemies: enemies,
      currentEnemyIndex: 0,
      playerHp: eff.battle.maxHp, 
      playerMaxHp: eff.battle.maxHp,
      log: ['戦闘開始！'],
      isOver: false,
      lastTick: Date.now(),
      isBossDefeated: false,
      lastDamageType: null,
      lastDamageTime: 0,
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

  // 勝利時の処理（スコア計算・実績更新を含む）
  const handleWin = (stage, resultData = {}) => {
    const { clearTime = 0, typeCount = 0, missCount = 0, missedWords = {}, missedKeys = {} } = resultData;
    
    const score = calculateScore(stage, clearTime, missCount);
    const cpm = calculateCPM(typeCount, clearTime);
    
    const gold = stage * 100 + Math.floor(Math.random() * 50);
    const item = generateItem(player.level, player.job);
    let newPlayer = { ...player };
    newPlayer.gold += gold;
    newPlayer.exp += stage * 50;
    
    // 実績更新
    if (!newPlayer.records) {
      newPlayer.records = { totalTypes: 0, totalMiss: 0, dungeonClears: 0, missedWords: {}, missedKeys: {}, daily: {} };
    }
    
    newPlayer.records.totalTypes += typeCount;
    newPlayer.records.totalMiss += missCount;
    newPlayer.records.dungeonClears += 1;
    
    // 苦手ワード集計
    Object.entries(missedWords).forEach(([word, count]) => {
      newPlayer.records.missedWords[word] = (newPlayer.records.missedWords[word] || 0) + count;
    });

    // 苦手キー集計
    if (!newPlayer.records.missedKeys) newPlayer.records.missedKeys = {};
    Object.entries(missedKeys).forEach(([key, count]) => {
      newPlayer.records.missedKeys[key] = (newPlayer.records.missedKeys[key] || 0) + count;
    });
    
    // 日次データ更新
    const today = getTodayString();
    if (!newPlayer.records.daily[today]) {
      newPlayer.records.daily[today] = { clears: 0, types: 0, time: 0 };
    }
    newPlayer.records.daily[today].clears += 1;
    newPlayer.records.daily[today].types += typeCount;
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
    if (stage === newPlayer.maxStage) {
      newPlayer.maxStage += 1;
    }
    
    setPlayer(newPlayer);
    setInventory(prev => [...prev, item]);
    setModalMessage({
      type: 'WIN',
      title: 'STAGE CLEAR!',
      gold,
      item,
      levelUpInfo,
      scoreInfo: { score, cpm, missCount, clearTime }
    });
    setGameState('RESULT');
  };

  const handleLose = () => {
    setModalMessage({
      type: 'LOSE',
      title: 'GAME OVER...',
    });
    setGameState('RESULT');
  };

  // 途中離脱処理
  const handleRetreat = () => {
    setGameState('TOWN');
  };

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

  const handleGuestStart = () => {
     setIsGuest(true);
     setPlayer(null);
     setShowAuth(false);
     setGameState('INIT');
  };

  const handleJoinRoom = (roomId, role) => {
    setMultiplayerRoomId(roomId);
    setMultiplayerRole(role);
    setGameState('MULTI_BATTLE');
  };

  if (showAuth) {
    return (
      <AuthScreen 
         onLogin={handleAuthSuccess} 
         onGuest={handleGuestStart}
         onBack={() => setShowAuth(false)}
      />
    );
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
          onDelete={() => { 
             if(window.confirm('本当にデータを削除しますか？')) { 
                if (isGuest) {
                   setPlayer(null);
                   setInventory([]);
                   setEquipped({});
                   setShopItems([]);
                } else {
                   setPlayer(null); 
                }
             }
          }} 
          difficulty={difficulty} 
          setDifficulty={setDifficulty}
          onShowAuth={() => setShowAuth(true)}
          onMultiplayer={() => setGameState('LOBBY')}
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
      
      {/* 新規画面: ロビー */}
      {gameState === 'LOBBY' && player && fbUser && (
        <LobbyScreen 
          player={player}
          userId={fbUser.uid} 
          difficulty={difficulty}
          onJoinRoom={handleJoinRoom}
          onBack={() => setGameState('TITLE')}
        />
      )}

      {/* 新規画面: マルチプレイ対戦 */}
      {gameState === 'MULTI_BATTLE' && player && multiplayerRoomId && fbUser && (
        <MultiplayerBattleScreen 
          roomId={multiplayerRoomId}
          playerRole={multiplayerRole}
          player={player}
          userId={fbUser.uid} 
          onFinish={() => setGameState('LOBBY')}
        />
      )}

      {gameState === 'RESULT' && <ResultModal message={modalMessage} onTown={() => { setModalMessage(null); setGameState('TOWN'); }} />}
    </div>
  );
}