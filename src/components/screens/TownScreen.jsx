import React, { useState, useEffect } from 'react';
import { 
  FileText, Megaphone, Mail, Settings
} from 'lucide-react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, arrayUnion, query, where } from 'firebase/firestore'; 
import { db, GAME_APP_ID } from '../../lib/firebase';

// 分割したコンポーネントをインポート
import MenuSidebar from './town/MenuSidebar';
import HomeView from './town/HomeView';
import StatusView from './town/StatusView';
import ShopView from './town/ShopView';
import TradeView from './town/TradeView';
import DungeonView from './town/DungeonView';
import InventoryView from './town/InventoryView';
import DashboardView from './town/DashboardView';
import PlaceholderView from './town/PlaceholderView';
import ArenaView from './town/ArenaView';
import GachaView from './town/GachaView';
import FriendView from './town/FriendView';
import MailView from './town/MailView';
import SettingsView from './town/SettingsView';

const TownScreen = ({ 
  player, inventory, equipped, 
  shopItems, setShopItems, setPlayer, setInventory,
  onEquip, onUnequip, onStartBattle, onLogout, onClassChange, difficulty, setDifficulty, // ★setDifficulty追加
  onStartArena,
  isGuest
}) => {
  const [activeView, setActiveView] = useState('HOME');
  const [selectedStage, setSelectedStage] = useState(1);
  const [chatTarget, setChatTarget] = useState(null);
  const [badgeCounts, setBadgeCounts] = useState({ friend: 0, mail: 0 });

  useEffect(() => {
    if (!player || isGuest) return;

    const giftsRef = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'gifts');
    const unsubGifts = onSnapshot(giftsRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const giftData = change.doc.data();
          const item = giftData.item;
          setInventory(prev => [...prev, item]);
          try {
            const userRef = doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'saveData', 'current');
            await updateDoc(userRef, { inventory: arrayUnion(item) });
            await deleteDoc(change.doc.ref);
            alert(`🎁 ${giftData.senderName}さんからプレゼント\n「${item.name}」が届きました！`);
          } catch (e) {
            console.error("Gift receive error:", e);
          }
        }
      });
    });

    const requestsRef = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friendRequests');
    const unsubRequests = onSnapshot(requestsRef, (snapshot) => {
      setBadgeCounts(prev => ({ ...prev, friend: snapshot.size }));
    });

    const chatsRef = collection(db, 'artifacts', GAME_APP_ID, 'chats');
    const qChats = query(chatsRef, where('participants', 'array-contains', player.id));
    const unsubChats = onSnapshot(qChats, (snapshot) => {
      let unreadCount = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.senderId !== player.id && data.read === false) {
          unreadCount++;
        }
      });
      setBadgeCounts(prev => ({ ...prev, mail: unreadCount }));
    });

    return () => {
      unsubGifts();
      unsubRequests();
      unsubChats();
    };
  }, [player, isGuest, setInventory]);

  const toggleLock = (itemId) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, locked: !item.locked };
      }
      return item;
    }));
  };

  const handleGoToDungeon = (stage) => {
    setSelectedStage(stage);
    setActiveView('DUNGEON');
  };

  const handleStartChat = (friend) => {
    setChatTarget(friend);
    setActiveView('MAIL');
  };

  const renderContent = () => {
    switch(activeView) {
      case 'HOME': return <HomeView player={player} difficulty={difficulty} onMoveToDungeon={handleGoToDungeon} />;
      case 'STATUS': return <StatusView player={player} equipped={equipped} onClassChange={onClassChange} />;
      case 'SHOP': return <ShopView player={player} inventory={inventory} equipped={equipped} shopItems={shopItems} setShopItems={setShopItems} setPlayer={setPlayer} setInventory={setInventory} />;
      case 'TRADE':
        if (isGuest) return <HomeView player={player} difficulty={difficulty} />;
        return <TradeView player={player} inventory={inventory} equipped={equipped} setPlayer={setPlayer} setInventory={setInventory} />;
      case 'DUNGEON': return <DungeonView player={player} selectedStage={selectedStage} setSelectedStage={setSelectedStage} onStartBattle={onStartBattle} difficulty={difficulty} />;
      case 'ITEM':
        return <InventoryView player={player} inventory={inventory} equipped={equipped} onEquip={onEquip} onUnequip={onUnequip} toggleLock={toggleLock} setPlayer={setPlayer} setInventory={setInventory} />;
      case 'ACHIEVEMENT': return <DashboardView player={player} />;
      case 'ARENA': 
        if (isGuest) return <HomeView player={player} difficulty={difficulty} />;
        return <ArenaView player={player} equipped={equipped} userId={player.id || 'guest'} onStartMatch={onStartArena} />;
      case 'GACHA': return <GachaView player={player} setPlayer={setPlayer} setInventory={setInventory} />;
      case 'QUEST': return <PlaceholderView title="クエスト" icon={<FileText size={48}/>} />;
      case 'FRIEND':
        if (isGuest) return <HomeView player={player} difficulty={difficulty} />;
        return <FriendView player={player} inventory={inventory} setInventory={setInventory} onStartChat={handleStartChat} />;
      case 'MAIL':
        if (isGuest) return <HomeView player={player} difficulty={difficulty} />;
        return <MailView player={player} initialTarget={chatTarget} onClose={() => { setChatTarget(null); setActiveView('FRIEND'); }} />;
      case 'INFO': return <PlaceholderView title="お知らせ" icon={<Megaphone size={48}/>} />;
      case 'SETTINGS':
        // ★修正: setDifficulty, difficultyを渡す
        return <SettingsView player={player} setPlayer={setPlayer} difficulty={difficulty} setDifficulty={setDifficulty} />;
      default: return <HomeView player={player} difficulty={difficulty} onMoveToDungeon={handleGoToDungeon} />;
    }
  };

  return (
    <div className="h-full w-full flex bg-slate-900 overflow-hidden font-sans select-none">
      <div className="flex-1 relative overflow-hidden shadow-inner">
        {renderContent()}
      </div>
      <MenuSidebar 
        player={player} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={onLogout} 
        difficulty={difficulty} 
        isGuest={isGuest}
        badgeCounts={badgeCounts}
      />
    </div>
  );
};

export default TownScreen;