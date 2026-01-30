import React, { useState } from 'react';
import { 
  FileText, Megaphone, Mail, Settings
} from 'lucide-react';

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
  onEquip, onUnequip, onStartBattle, onLogout, onClassChange, difficulty,
  onStartArena,
  isGuest
}) => {
  const [activeView, setActiveView] = useState('HOME');
  const [selectedStage, setSelectedStage] = useState(1);
  const [chatTarget, setChatTarget] = useState(null); // チャット相手の一時保存用

  // アイテムロック切り替え関数
  const toggleLock = (itemId) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, locked: !item.locked };
      }
      return item;
    }));
  };

  // ホームからダンジョンへ遷移
  const handleGoToDungeon = (stage) => {
    setSelectedStage(stage);
    setActiveView('DUNGEON');
  };

  // フレンド画面からチャットを開始する
  const handleStartChat = (friend) => {
    setChatTarget(friend);
    setActiveView('MAIL');
  };

  // 画面のレンダリング振り分け
  const renderContent = () => {
    switch(activeView) {
      case 'HOME':
        return <HomeView player={player} difficulty={difficulty} onMoveToDungeon={handleGoToDungeon} />;
      
      case 'STATUS':
        return <StatusView player={player} equipped={equipped} onClassChange={onClassChange} />;
      
      case 'SHOP':
        return <ShopView player={player} inventory={inventory} equipped={equipped} shopItems={shopItems} setShopItems={setShopItems} setPlayer={setPlayer} setInventory={setInventory} />;
      
      case 'TRADE':
        if (isGuest) return <HomeView player={player} difficulty={difficulty} />;
        return <TradeView player={player} inventory={inventory} equipped={equipped} setPlayer={setPlayer} setInventory={setInventory} />;
      
      case 'DUNGEON':
        return <DungeonView player={player} selectedStage={selectedStage} setSelectedStage={setSelectedStage} onStartBattle={onStartBattle} difficulty={difficulty} />;
      
      case 'ITEM':
        return <InventoryView player={player} inventory={inventory} equipped={equipped} onEquip={onEquip} onUnequip={onUnequip} toggleLock={toggleLock} />;
      
      case 'ACHIEVEMENT':
        return <DashboardView player={player} />;
      
      case 'ARENA': 
        if (isGuest) return <HomeView player={player} difficulty={difficulty} />;
        return <ArenaView player={player} equipped={equipped} userId={player.id || 'guest'} onStartMatch={onStartArena} />;

      case 'GACHA':
        return <GachaView player={player} setPlayer={setPlayer} setInventory={setInventory} />;

      case 'QUEST':
        return <PlaceholderView title="クエスト" icon={<FileText size={48}/>} />;
      
      case 'FRIEND':
        if (isGuest) return <HomeView player={player} difficulty={difficulty} />;
        return (
          <FriendView 
            player={player} 
            inventory={inventory}
            setInventory={setInventory}
            onStartChat={handleStartChat} 
          />
        );

      case 'MAIL':
        if (isGuest) return <HomeView player={player} difficulty={difficulty} />;
        return (
          <MailView 
            player={player} 
            initialTarget={chatTarget} 
            onClose={() => { setChatTarget(null); setActiveView('FRIEND'); }}
          />
        );

      case 'INFO':
        return <PlaceholderView title="お知らせ" icon={<Megaphone size={48}/>} />;
      
      case 'SETTINGS':
        // ★修正: setPlayerを渡す
        return <SettingsView player={player} setPlayer={setPlayer} />;
      
      default:
        return <HomeView player={player} difficulty={difficulty} onMoveToDungeon={handleGoToDungeon} />;
    }
  };

  return (
    <div className="h-full w-full flex bg-slate-900 overflow-hidden font-sans select-none">
      {/* 左側：コンテンツエリア */}
      <div className="flex-1 relative overflow-hidden shadow-inner">
        {renderContent()}
      </div>

      {/* 右側：サイドバーメニュー */}
      <MenuSidebar 
        player={player} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={onLogout} 
        difficulty={difficulty} 
        isGuest={isGuest}
      />
    </div>
  );
};

export default TownScreen;