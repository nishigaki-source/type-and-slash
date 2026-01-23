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
  calculateEffectiveStats 
} from './utils/gameLogic';

// 分割したコンポーネントをインポート
import AuthScreen from './components/screens/AuthScreen';
import TitleScreen from './components/screens/TitleScreen';
import CharCreateScreen from './components/screens/CharCreateScreen';
import TownScreen from './components/screens/TownScreen';
import ShopScreen from './components/screens/ShopScreen';
import ClassChangeScreen from './components/screens/ClassChangeScreen';
import BattleScreen from './components/screens/BattleScreen';
import ResultModal from './components/ui/ResultModal';
// 新規追加したマルチプレイ用コンポーネント
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
        // Firestoreからロード
        try {
          const docRef = doc(db, 'artifacts', GAME_APP_ID, 'users', fbUser.uid, 'saveData', 'current');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPlayer(data.player);
            setInventory(data.inventory || []);
            setEquipped(data.equipped || { HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null });
            setGameState('TITLE');
          } else {
             // データなし -> キャラ作成へ
             setGameState('CHAR_CREATE');
          }
        } catch (e) {
          console.error("Load Error:", e);
          setGameState('TITLE');
        }
      } else if (isGuest) {
        // ゲストはメモリ上のみなので新規作成へ
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
          const data = { player, inventory, equipped };
          const docRef = doc(db, 'artifacts', GAME_APP_ID, 'users', fbUser.uid, 'saveData', 'current');
          await setDoc(docRef, data);
        } catch (e) {
          console.error("Save Error:", e);
        }
      };
      saveData();
    }
  }, [player, inventory, equipped, fbUser, isGuest]);

  const refreshShop = useCallback((currentShop = []) => {
     if(!player) return;
     const newItems = [];
     newItems.push(generateConsumable());
     newItems.push(generateConsumable());
     for(let i=0; i<3; i++) {
        newItems.push(generateItem(player.level));
     }
     setShopItems(newItems);
  }, [player]);

  useEffect(() => {
     if(gameState === 'TOWN' && shopItems.length === 0 && player) {
         refreshShop();
     }
  }, [gameState, player, shopItems.length, refreshShop]);

  const handleCreateChar = (formData) => {
    const initialStats = calcInitialStats(formData.job, formData.race, formData.personality);
    const newPlayer = {
      name: formData.name, job: formData.job, race: formData.race, gender: formData.gender, personality: formData.personality,
      level: 1, exp: 0, gold: 500, maxStage: 1, stats: initialStats
    };
    const initialWeapon = generateItem(1, formData.job);
    initialWeapon.type = 'WEAPON';
    initialWeapon.name = '初心者の' + (JOBS[formData.job].weapon);
    
    const initialPotions = [
      generateConsumable(), generateConsumable(), generateConsumable()
    ].map(p => ({ ...p, consumableId: 'POTION_S', name: 'ポーション' }));

    setPlayer(newPlayer);
    setInventory([initialWeapon, ...initialPotions]);
    setEquipped(prev => ({ ...prev, WEAPON: initialWeapon }));
    setGameState('TOWN');
  };
  
  const handleChangeClass = (newJobId, cost) => {
    if (!player) return;
    const newGold = player.gold - cost;
    const currentWeapon = equipped.WEAPON;
    const newEquipped = { ...equipped, WEAPON: null };
    const newInventory = [...inventory];
    if (currentWeapon) newInventory.push(currentWeapon);

    let newStats = calcInitialStats(newJobId, player.race, player.personality);
    const levelsToGrow = player.level - 1;
    if (levelsToGrow > 0) {
      const growthResult = growStats(newStats, newJobId, levelsToGrow);
      newStats = growthResult.newStats;
    }

    const newPlayer = { ...player, job: newJobId, gold: newGold, stats: newStats };
    setPlayer(newPlayer);
    setInventory(newInventory);
    setEquipped(newEquipped);
    setGameState('TOWN');
    alert(`${JOBS[newJobId].name} に転職しました！\nステータスが再計算されました。`);
  };

  const startBattle = (stage) => {
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

  const handleWin = (stage) => {
    const gold = stage * 100 + Math.floor(Math.random() * 50);
    const item = generateItem(player.level, player.job);
    let newPlayer = { ...player };
    newPlayer.gold += gold;
    newPlayer.exp += stage * 50;
    
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
    refreshShop();
    setPlayer(newPlayer);
    setInventory(prev => [...prev, item]);
    setModalMessage({
      type: 'WIN',
      title: 'STAGE CLEAR!',
      gold,
      item,
      levelUpInfo
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

  // ロビーから対戦画面への遷移ハンドラ
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
                } else {
                   setPlayer(null); 
                }
             }
          }} 
          difficulty={difficulty} 
          setDifficulty={setDifficulty}
          onShowAuth={() => setShowAuth(true)}
          // 新規追加: ロビー画面へ遷移
          onMultiplayer={() => setGameState('LOBBY')}
        />
      }
      {gameState === 'CHAR_CREATE' && <CharCreateScreen onCreate={handleCreateChar} onBack={handleLogout} />}
      {gameState === 'TOWN' && player && <TownScreen player={player} inventory={inventory} equipped={equipped} onEquip={handleEquip} onUnequip={handleUnequip} onStartBattle={startBattle} onLogout={handleLogout} onOpenShop={() => setGameState('SHOP')} onClassChange={() => setGameState('CLASS_CHANGE')} difficulty={difficulty} />}
      {gameState === 'SHOP' && player && <ShopScreen player={player} inventory={inventory} equipped={equipped} setPlayer={setPlayer} setInventory={setInventory} onBack={() => setGameState('TOWN')} shopItems={shopItems} onRefreshShop={setShopItems} />}
      {gameState === 'CLASS_CHANGE' && player && <ClassChangeScreen player={player} onChangeClass={handleChangeClass} onBack={() => setGameState('TOWN')} />}
      
      {/* シングルプレイ用バトル画面 */}
      {gameState === 'BATTLE' && battleState && player && <BattleScreen battleState={battleState} setBattleState={setBattleState} player={player} equipped={equipped} inventory={inventory} setInventory={setInventory} onWin={handleWin} onLose={handleLose} difficulty={difficulty} />}
      
      {/* 新規画面: ロビー */}
      {gameState === 'LOBBY' && player && (
        <LobbyScreen 
          player={player}
          difficulty={difficulty}
          onJoinRoom={handleJoinRoom}
          onBack={() => setGameState('TITLE')}
        />
      )}

      {/* 新規画面: マルチプレイ対戦 */}
      {gameState === 'MULTI_BATTLE' && player && multiplayerRoomId && (
        <MultiplayerBattleScreen 
          roomId={multiplayerRoomId}
          playerRole={multiplayerRole}
          player={player}
          onFinish={() => setGameState('LOBBY')}
        />
      )}

      {gameState === 'RESULT' && <ResultModal message={modalMessage} onTown={() => { setModalMessage(null); setGameState('TOWN'); }} />}
    </div>
  );
}