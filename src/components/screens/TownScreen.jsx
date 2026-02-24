import React, { useState, useEffect } from 'react';
import { 
  FileText, Megaphone, Mail, Settings
} from 'lucide-react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, arrayUnion, query, where } from 'firebase/firestore'; 
import { db, GAME_APP_ID } from '../../lib/firebase';

// 各種ビューコンポーネントのインポート
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
  onEquip, onUnequip, onStartBattle, onLogout, difficulty, setDifficulty,
  onStartArena,
  isGuest,
  charGachaData,
  // 多言語対応用の追加 props
  language,
  setLanguage,
  t }) => {

  const [activeView, setActiveView] = useState('HOME');
  const [selectedStage, setSelectedStage] = useState(1);
  const [chatTarget, setChatTarget] = useState(null);
  const [badgeCounts, setBadgeCounts] = useState({ friend: 0, mail: 0 });

  // プレゼント、フレンド申請、チャット未読のリアルタイム監視
  useEffect(() => {
    if (!player || isGuest) return;

    // プレゼントボックスの監視
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
            // アラートメッセージも本来は t() を使うのが理想的です
            alert(`🎁 ${giftData.senderName}さんからプレゼント\n「${item.name}」が届きました！`);
          } catch (e) {
            console.error("Gift receive error:", e);
          }
        }
      });
    });

    // フレンド申請の監視
    const requestsRef = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friendRequests');
    const unsubRequests = onSnapshot(requestsRef, (snapshot) => {
      setBadgeCounts(prev => ({ ...prev, friend: snapshot.size }));
    });

    // チャット未読の監視
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

  // 言語と翻訳関数を各 View に渡す
  const renderContent = () => {
    // 共通の props オブジェクト
    const commonProps = { language, t };

    switch(activeView) {
      case 'HOME': 
        return <HomeView player={player} difficulty={difficulty} onMoveToDungeon={handleGoToDungeon} {...commonProps} />;
      case 'STATUS': 
        return <StatusView player={player} setPlayer={setPlayer} equipped={equipped} charGachaData={charGachaData} {...commonProps} />;
      case 'SHOP': 
        return <ShopView player={player} inventory={inventory} equipped={equipped} shopItems={shopItems} setShopItems={setShopItems} setPlayer={setPlayer} setInventory={setInventory} {...commonProps} />;
      case 'TRADE':
        if (isGuest) return <HomeView player={player} difficulty={difficulty} {...commonProps} />;
        return <TradeView player={player} inventory={inventory} equipped={equipped} setPlayer={setPlayer} setInventory={setInventory} {...commonProps} />;
      case 'DUNGEON': 
        return <DungeonView player={player} selectedStage={selectedStage} setSelectedStage={setSelectedStage} onStartBattle={onStartBattle} difficulty={difficulty} {...commonProps} />;
      case 'ITEM':
        return <InventoryView player={player} inventory={inventory} equipped={equipped} onEquip={onEquip} onUnequip={onUnequip} toggleLock={toggleLock} setPlayer={setPlayer} setInventory={setInventory} {...commonProps} />;
      case 'ACHIEVEMENT': 
        return <DashboardView player={player} {...commonProps} />;
      case 'ARENA': 
        if (isGuest) return <HomeView player={player} difficulty={difficulty} {...commonProps} />;
        return <ArenaView player={player} equipped={equipped} userId={player.id || 'guest'} onStartMatch={onStartArena} {...commonProps} />;
      case 'GACHA': 
        return <GachaView player={player} setPlayer={setPlayer} setInventory={setInventory} charGachaData={charGachaData} {...commonProps} />;
      case 'QUEST': 
        return <PlaceholderView title={t('QUEST')} icon={<FileText size={48}/>} />;
      case 'FRIEND':
        if (isGuest) return <HomeView player={player} difficulty={difficulty} {...commonProps} />;
        return <FriendView player={player} inventory={inventory} setInventory={setInventory} onStartChat={handleStartChat} {...commonProps} />;
      case 'MAIL':
        if (isGuest) return <HomeView player={player} difficulty={difficulty} {...commonProps} />;
        return <MailView player={player} initialTarget={chatTarget} onClose={() => { setChatTarget(null); setActiveView('FRIEND'); }} {...commonProps} />;
      case 'INFO': 
        return <PlaceholderView title={t('INFO')} icon={<Megaphone size={48}/>} />;
      case 'SETTINGS':
        return (
          <SettingsView 
            player={player} 
            setPlayer={setPlayer} 
            difficulty={difficulty} 
            setDifficulty={setDifficulty} 
            language={language} 
            setLanguage={setLanguage} 
            t={t} 
          />
        );
      default: 
        return <HomeView player={player} difficulty={difficulty} onMoveToDungeon={handleGoToDungeon} {...commonProps} />;
    }
  };

  return (
    <div className="h-full w-full flex bg-slate-900 overflow-hidden font-sans select-none">
      <div className="flex-1 relative overflow-hidden shadow-inner">
        {renderContent()}
      </div>
      {/* サイドメニューにも言語設定を渡す */}
      <MenuSidebar 
        player={player} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={onLogout} 
        difficulty={difficulty} 
        isGuest={isGuest}
        badgeCounts={badgeCounts}
        language={language}
        t={t}
      />
    </div>
  );
};

export default TownScreen;