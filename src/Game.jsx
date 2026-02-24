import React, { useState, useEffect, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './lib/firebase';

// カスタムフックのインポート
import { useGameState } from './hooks/useGameState';
import { useGameData } from './hooks/useGameData';
import { useAudio } from './hooks/useAudio';

// ロジック・データ関連のインポート
import { MONSTER_DATA } from './constants/monsters';
import { DIFFICULTY_SETTINGS } from './constants/data';
import { 
  generateId, 
  calculateEffectiveStats,
  calculateScore,
  calculateCPM,
  getTodayString,
  getTreasureChests,
  openTreasureChest,
  growStats
} from './utils/gameLogic';

// スクリーン・コンポーネントのインポート
import AuthScreen from './components/screens/AuthScreen';
import TitleScreen from './components/screens/TitleScreen';
import CharCreateScreen from './components/screens/CharCreateScreen';
import TownScreen from './components/screens/TownScreen';
import BattleScreen from './components/screens/BattleScreen';
import ResultModal from './components/ui/ResultModal';
import TreasureSelectionModal from './components/ui/TreasureSelectionModal';
import LobbyScreen from './components/screens/LobbyScreen';
import MultiplayerBattleScreen from './components/screens/MultiplayerBattleScreen';
import { StoryModal } from './components/ui/StoryModal'; // ストーリー用モーダル

export default function TypingGame() {
  // 1. ゲームの基本ステートとロジックを hook から取得
  const gameStateObj = useGameState();
  const {
    gameState, setGameState,
    player, setPlayer,
    inventory, setInventory,
    equipped, setEquipped,
    shopItems, setShopItems,
    difficulty, setDifficulty,
    language, setLanguage,
    fbUser, isGuest, setIsGuest,
    showAuth, setShowAuth,
    battleState, setBattleState,
    modalMessage, setModalMessage,
    treasureChests, setTreasureChests,
    tempResultData, setTempResultData,
    multiplayerRoomId, multiplayerRole, isArenaMode,
    isMuted, setIsMuted,
    handleCreateChar,
    loadUserData,
    saveUserData,
    handleGuestStart,
    handleGuestMultiplayer,
    handleEquip,
    handleUnequip,
    handleJoinRoom,
    handleStartArena
  } = gameStateObj;

  // 2. 外部データ（CSV）の取得ロジックを hook から取得
  // openingStory (スプレッドシートデータ) を取得
  const { uiTextData, floorWords, charGachaData, openingStory, dataLoaded } = useGameData();

  // 3. 音声制御ロジックを hook で実行
  useAudio(gameState, showAuth, isMuted, battleState);

  // --- 追加ステート: ストーリー進行用 ---
  const [storyStep, setStoryStep] = useState(0);
  const [tempPlayerName, setTempPlayerName] = useState("");

  // 翻訳ヘルパー関数
  const t = useCallback((key) => {
    if (!uiTextData[key]) return key;
    return uiTextData[key][language] || uiTextData[key]['JA_KANJI'];
  }, [uiTextData, language]);

  // Firebase認証ユーザーの変化に応じたデータロード
  useEffect(() => {
    if (fbUser && !isGuest && gameState === 'INIT') {
      loadUserData(fbUser);
    }
  }, [fbUser, isGuest, gameState, loadUserData]);

  // データの自動保存
  useEffect(() => {
    saveUserData();
  }, [saveUserData]);

  // --- ストーリー進行ロジック ---
  const handleNextStory = () => {
    if (storyStep < openingStory.length - 1) {
      setStoryStep(storyStep + 1);
    }
  };

  const handleStoryAction = (uiType, payload = null) => {
  const type = uiType ? uiType.trim() : "";

  switch (type) {
    case 'INPUT_NAME':
      // payload に入力された名前が入ってくる
      if (payload) {
        setTempPlayerName(payload);
        handleNextStory();
      }
      break;

    case 'SELECT_JOB':
    case 'START_GAME':
      setGameState('CHAR_CREATE');
      break;

    default:
      handleNextStory();
      break;
  }
};

  // 戦闘開始処理
  const startBattle = (stage) => {
    if (!MONSTER_DATA || Object.keys(MONSTER_DATA).length === 0) return;
    const eff = calculateEffectiveStats(player, equipped);
    const wordPool = floorWords[difficulty]?.[stage] || floorWords[difficulty]?.["1"] || [{ display: "Ready", romaji: "ready" }];
    const enemies = [];
    const intervalBase = Math.max(1000, 5000 - ((stage - 1) * 40));

    const FIXED_BOSSES = {
      10: "Cerberus", 20: "Basilisk", 30: "Goblin_Lord", 40: "Orc_King", 50: "Ifrit",
      60: "Dragon", 70: "Blood_Medusa", 80: "Minotaur_General", 90: "Fire_Dragon",
      91: "Goblin_Emperor", 92: "Orc_Emperor", 93: "Demon_Lord", 94: "Bol-Storm",
      95: "Gal-Fen", 96: "Val-Terra", 97: "Abyss-Minos", 98: "Aza-Tul", 99: "Rag-Blood", 100: "Ragna-Inferno" 
    };

    const isBossFloor = (stage % 10 === 0) || (stage >= 91 && stage <= 100);

    for (let i = 0; i < 10; i++) {
      const isBoss = (i === 9) && isBossFloor;
      let mData;
      if (isBoss) {
        const fixedBossKey = FIXED_BOSSES[stage];
        if (fixedBossKey && MONSTER_DATA[fixedBossKey]) {
          mData = MONSTER_DATA[fixedBossKey];
        } else {
          const avKeys = Object.keys(MONSTER_DATA).filter(k => {
            const m = MONSTER_DATA[k];
            return Number(stage) >= m.minFloor && Number(stage) <= m.maxFloor && m.isBossOnly;
          });
          mData = MONSTER_DATA[avKeys[Math.floor(Math.random() * avKeys.length)] || Object.keys(MONSTER_DATA)[0]];
        }
      } else {
        const avKeys = Object.keys(MONSTER_DATA).filter(k => {
          const m = MONSTER_DATA[k];
          return Number(stage) >= m.minFloor && Number(stage) <= m.maxFloor && !m.isBossOnly;
        });
        mData = MONSTER_DATA[avKeys[Math.floor(Math.random() * avKeys.length)] || Object.keys(MONSTER_DATA)[0]];
      }

      enemies.push({
        id: generateId(),
        name: isBoss ? `BOSS: ${mData.name}` : mData.name,
        imageId: mData.imageId,
        type: mData.key,
        hp: mData.hp,
        maxHp: mData.hp,
        atk: mData.atk,
        word: wordPool[Math.floor(Math.random() * wordPool.length)],
        isBoss,
        attackInterval: isBoss ? Math.max(800, intervalBase * 0.75) : intervalBase,
        currentAttackGauge: 0
      });
    }
  
    const currentZone = DIFFICULTY_SETTINGS[difficulty].zones.find(z => stage >= z.range[0] && stage <= z.range[1]) || DIFFICULTY_SETTINGS[difficulty].zones[0];
    
    setBattleState({ 
      stage, zoneName: currentZone.name, enemies, currentEnemyIndex: 0, 
      playerHp: eff.battle.maxHp, playerMaxHp: eff.battle.maxHp, 
      log: [`${currentZone.name} (B${stage}F) ${t('BATTLE_START') || 'に突入！'}`], 
      isOver: false, lastTick: Date.now(), isBossDefeated: false, 
      lastDamageType: null, lastDamageTime: 0, 
      statusAilments: { poison: false, paralysis: false }, 
      buffs: { str: 0, vit: 0, agi: 0, dex: 0 },
      monsterAtk: 10
    });
    setGameState('BATTLE');
  };

  const handleWin = (stage, resultData = {}) => {
    const { clearTime = 0, typeCount = 0, missCount = 0, missedWords = {}, missedKeys = {} } = resultData;
    const score = calculateScore(stage, clearTime, missCount);
    const cpm = calculateCPM(typeCount, clearTime);
    const gold = stage * 100 + Math.floor(Math.random() * 50);
    const chests = getTreasureChests();

    setTempResultData({ stage, gold, score, cpm, typeCount, missCount, clearTime, missedWords, missedKeys, chests });
    setTreasureChests(chests);
    setGameState('TREASURE');
  };

  const handleChestSelect = (selectedChest) => {
    if (!tempResultData) return;
    const equipment = openTreasureChest(selectedChest, player.level, player.job);
    const { stage, gold, missedWords, missedKeys, clearTime, typeCount, missCount } = tempResultData;
    
    let newPlayer = { ...player };
    newPlayer.gold += gold;
    newPlayer.exp += stage * 50;
    
    if (!newPlayer.records) newPlayer.records = { totalTypes: 0, totalMiss: 0, dungeonClears: 0, arenaChallenges: 0, missedWords: {}, missedKeys: {}, daily: {} };
    newPlayer.records.totalTypes += (typeCount || 0); 
    newPlayer.records.totalMiss += missCount;
    newPlayer.records.dungeonClears += 1;
    
    Object.entries(missedWords).forEach(([word, count]) => {
      newPlayer.records.missedWords[word] = (newPlayer.records.missedWords[word] || 0) + count;
    });
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
    setInventory(prev => [...prev, equipment]);
    setModalMessage({ 
      type: 'WIN', title: 'STAGE CLEAR!', gold, items: [equipment], levelUpInfo, 
      scoreInfo: { score: tempResultData.score, cpm: tempResultData.cpm, missCount, clearTime } 
    });
    setGameState('RESULT');
    setTempResultData(null); 
  };

  const handleLose = () => {
    setModalMessage({ type: 'LOSE', title: 'GAME OVER...' });
    setGameState('RESULT');
  };

  const handleLogout = async () => {
     await signOut(auth);
     setPlayer(null);
     setIsGuest(false);
     setGameState('TITLE'); 
     setShowAuth(false);
     setStoryStep(0); // ストーリー進行をリセット
     setTempPlayerName("");
  };

  const handleMultiFinish = (result, stats) => {
    let newPlayer = { ...player };
    if (stats) {
      if (!newPlayer.records) newPlayer.records = { totalTypes: 0, totalMiss: 0, dungeonClears: 0, arenaChallenges: 0, missedWords: {}, missedKeys: {}, daily: {} };
      newPlayer.records.totalTypes = (newPlayer.records.totalTypes || 0) + stats.typeCount;
      newPlayer.records.totalMiss = (newPlayer.records.totalMiss || 0) + stats.missCount;
    }
    setPlayer(newPlayer);
    setGameState(isArenaMode ? 'TOWN' : 'LOBBY');
  };

  if (!dataLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-bold">データ読み込み中...</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <AuthScreen onLogin={() => { setIsGuest(false); setShowAuth(false); setGameState('INIT'); }} onGuest={handleGuestStart} onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="w-full h-screen bg-slate-50 overflow-hidden font-sans select-none relative">
      {gameState === 'TITLE' && 
        <TitleScreen 
          player={player} onStartNew={() => setShowAuth(true)} onResume={() => setGameState('TOWN')} 
          difficulty={difficulty} setDifficulty={setDifficulty} onGuestMultiplayer={handleGuestMultiplayer} t={t}
        />
      }

      {/* --- ストーリー表示シーン --- */}
      {gameState === 'STORY' && openingStory.length > 0 && (
        <StoryModal 
          data={openingStory[storyStep]} 
          language={language} 
          playerName={tempPlayerName}
          onNext={handleNextStory} 
          onAction={handleStoryAction}
        />
      )}

      {gameState === 'CHAR_CREATE' && (
        <CharCreateScreen 
          initialName={tempPlayerName} // ストーリーで入力した名前を渡す
          onCreate={handleCreateChar} 
          onBack={handleLogout} 
          t={t} 
        />
      )}
      
      {gameState === 'TOWN' && player && 
        <TownScreen 
          player={player} inventory={inventory} equipped={equipped} shopItems={shopItems} setShopItems={setShopItems}
          setPlayer={setPlayer} setInventory={setInventory} onEquip={handleEquip} onUnequip={handleUnequip} 
          onStartBattle={startBattle} onLogout={handleLogout} difficulty={difficulty} setDifficulty={setDifficulty} 
          onStartArena={handleStartArena} isGuest={isGuest} charGachaData={charGachaData} language={language} setLanguage={setLanguage} t={t} 
        />
      }
  
      {gameState === 'BATTLE' && battleState && player && 
        <BattleScreen 
          battleState={battleState} setBattleState={setBattleState} player={player} equipped={equipped} 
          inventory={inventory} setInventory={setInventory} onWin={handleWin} onLose={handleLose} 
          onRetreat={() => setGameState('TOWN')} difficulty={difficulty} language={language} t={t}
        />
      }

      {gameState === 'TREASURE' && <TreasureSelectionModal chests={treasureChests} onSelect={handleChestSelect} t={t} />}
      
      {gameState === 'LOBBY' && player && (
        <LobbyScreen 
          player={player} equipped={equipped} userId={player.id} difficulty={difficulty}
          onJoinRoom={(id, role) => handleJoinRoom(id, role, false)}
          onBack={() => isGuest ? handleLogout() : setGameState('TOWN')} t={t}
        />
      )}

      {gameState === 'MULTI_BATTLE' && player && multiplayerRoomId && (
        <MultiplayerBattleScreen 
          roomId={multiplayerRoomId} playerRole={multiplayerRole} player={player}
          equipped={equipped} userId={player.id} onFinish={handleMultiFinish} t={t}
        />
      )}

      {/* ミュートボタン */}
      <div className="fixed right-4 bottom-4 z-[100]">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-full shadow-2xl border-2 transition-all active:scale-90 flex items-center justify-center ${isMuted ? 'bg-red-500 border-red-400 text-white' : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white backdrop-blur-sm'}`}
        >
          {isMuted ? 
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> : 
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          }
        </button>
      </div>

      {gameState === 'RESULT' && <ResultModal message={modalMessage} onTown={() => { setModalMessage(null); setGameState('TOWN'); }} />}
    </div>
  );
}