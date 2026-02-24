import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, GAME_APP_ID } from '../lib/firebase';
import { JOBS } from '../constants/data';
import { 
  calcInitialStats, 
  generateId, 
  generateItem, 
  generateConsumable 
} from '../utils/gameLogic';

export const useGameState = () => {
  const [gameState, setGameState] = useState('TITLE');
  const [player, setPlayer] = useState(null);
  const [fbUser, setFbUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({ 
    HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null 
  });
  const [shopItems, setShopItems] = useState([]);
  const [difficulty, setDifficulty] = useState('EASY');
  const [language, setLanguage] = useState('JA_KANJI');
  const [isMuted, setIsMuted] = useState(false);

  // バトル・結果関連の追加ステート
  const [battleState, setBattleState] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);
  const [treasureChests, setTreasureChests] = useState([]);
  const [tempResultData, setTempResultData] = useState(null);

  // マルチプレイ関連
  const [multiplayerRoomId, setMultiplayerRoomId] = useState(null);
  const [multiplayerRole, setMultiplayerRole] = useState(null); 
  const [isArenaMode, setIsArenaMode] = useState(false);

  // Firebase Authの監視
  useEffect(() => {
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
  const loadUserData = useCallback(async (user) => {
    try {
      const docRef = doc(db, 'artifacts', GAME_APP_ID, 'users', user.uid, 'saveData', 'current');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPlayer({ ...data.player, id: user.uid });
        setInventory(data.inventory || []);
        setEquipped(data.equipped || { HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null });
        if (data.shopItems?.length > 0) setShopItems(data.shopItems);
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.language) setLanguage(data.language);
        setGameState('TITLE'); 
      } else {
        setGameState('CHAR_CREATE');
      }
    } catch (e) {
      console.error("Load Error:", e);
      setGameState('TITLE');
    }
  }, []);

  // データセーブ
  const saveUserData = useCallback(async () => {
    if (player && fbUser && !isGuest) {
      try {
        const data = { player, inventory, equipped, shopItems, difficulty, language };
        const docRef = doc(db, 'artifacts', GAME_APP_ID, 'users', fbUser.uid, 'saveData', 'current');
        await setDoc(docRef, data);
      } catch (e) {
        console.error("Save Error:", e);
      }
    }
  }, [player, inventory, equipped, shopItems, difficulty, language, fbUser, isGuest]);

  // ゲストログイン (移植)
  const handleGuestStart = async () => {
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      setIsGuest(true);
      setPlayer(null); 
      setInventory([]);
      setEquipped({ HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null });
      setShopItems([]);
      setDifficulty('EASY');
      setShowAuth(false);
      setGameState('CHAR_CREATE'); 
    } catch (e) {
      alert("Guest login failed");
    }
  };

  // マルチプレイ用ゲストログイン (移植)
  const handleGuestMultiplayer = async () => {
    try {
      let currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        const cred = await signInAnonymously(auth);
        currentUid = cred.user.uid;
      }
      setIsGuest(true);
      const guestPlayer = {
        id: currentUid, 
        name: 'ゲスト' + generateId().substring(0,3),
        job: 'FIGHTER', race: 'HUMAN', gender: 'MALE',
        level: 10, stats: calcInitialStats('FIGHTER', 'HUMAN'),
        gold: 0, maxStage: 1,
        records: { totalTypes: 0, totalMiss: 0, dungeonClears: 0, arenaChallenges: 0, missedWords: {}, missedKeys: {}, daily: {} }
      };
      setPlayer(guestPlayer);
      setInventory([]);
      setEquipped({});
      setGameState('LOBBY');
    } catch (e) {
      alert("Guest Multiplayer error");
    }
  };

  // 装備変更 (移植)
  const handleEquip = (item) => {
    const slot = item.type === 'WEAPON' ? 'WEAPON' : item.type;
    setEquipped(prev => ({ ...prev, [slot]: item }));
  };

  const handleUnequip = (slot) => {
    setEquipped(prev => ({ ...prev, [slot]: null }));
  };

  // キャラクター作成
  const handleCreateChar = (formData) => {
    const initialStats = calcInitialStats(formData.job, formData.race); 
    const firstChar = {
      id: generateId(),
      name: formData.name, job: formData.job, race: formData.race, gender: formData.gender,
      stats: { ...initialStats }
    };

    const newPlayer = {
      id: fbUser?.uid,
      name: formData.name, job: formData.job, race: formData.race, gender: formData.gender,
      level: 1, exp: 0, gold: 500, maxStage: 1, stats: { ...initialStats },
      characters: [firstChar],
      arenaPoints: 0,
      records: { 
        totalTypes: 0, totalMiss: 0, dungeonClears: 0, 
        arenaChallenges: 0, missedWords: {}, missedKeys: {}, daily: {},
        levelGains: { hp: 0, str: 0, vit: 0, dex: 0, agi: 0, luk: 0 }
      }
    };

    const initialWeapon = generateItem(1, formData.job);
    initialWeapon.name = '初心者の' + (JOBS[formData.job].weapon);
    initialWeapon.jobReq = [formData.job];
    initialWeapon.imageId = 'beginner_sword.png'; 

    setPlayer(newPlayer);
    setInventory([initialWeapon, ...Array(3).fill(null).map(() => ({
      ...generateConsumable(), consumableId: 'POTION_S', name: 'ポーション'
    }))]);
    setEquipped({ HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: initialWeapon });
    setGameState('TOWN');
  };

  // 部屋参加・アリーナ開始 (移植)
  const handleJoinRoom = (roomId, role, isArena = false) => {
    setMultiplayerRoomId(roomId);
    setMultiplayerRole(role);
    setIsArenaMode(isArena);
    setGameState('MULTI_BATTLE');
  };

  const handleStartArena = (roomId, role) => handleJoinRoom(roomId, role, true);

  return {
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
  };
};