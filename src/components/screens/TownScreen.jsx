import React, { useState } from 'react';
import { 
  FileText, Megaphone, Mail
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

const TownScreen = ({ 
  player, inventory, equipped, 
  shopItems, setShopItems, setPlayer, setInventory,
  onEquip, onUnequip, onStartBattle, onLogout, onClassChange, difficulty,
  onStartArena,
  isGuest // 追加: ゲストフラグを受け取る
}) => {
  const [activeView, setActiveView] = useState('HOME');
  const [selectedStage, setSelectedStage] = useState(1);

  // アイテムロック切り替え関数
  const toggleLock = (itemId) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, locked: !item.locked };
      }
      return item;
    }));
  };

  // 画面のレンダリング振り分け
  const renderContent = () => {
    switch(activeView) {
      case 'HOME':
        return <HomeView />;
      
      case 'STATUS':
        return (
          <StatusView 
            player={player} 
            equipped={equipped} 
            onClassChange={onClassChange} 
          />
        );
      
      case 'SHOP':
        return (
          <ShopView 
            player={player} 
            inventory={inventory} 
            equipped={equipped} 
            shopItems={shopItems} 
            setShopItems={setShopItems} 
            setPlayer={setPlayer} 
            setInventory={setInventory} 
          />
        );
      
      case 'TRADE':
        // 念のためここでもガード（UI側で無効化されるが、直接指定された場合など）
        if (isGuest) return <HomeView />;
        return (
          <TradeView 
            player={player} 
            inventory={inventory} 
            equipped={equipped} 
            setPlayer={setPlayer} 
            setInventory={setInventory} 
          />
        );
      
      case 'DUNGEON':
        return (
          <DungeonView 
            player={player} 
            selectedStage={selectedStage} 
            setSelectedStage={setSelectedStage} 
            onStartBattle={onStartBattle} 
          />
        );
      
      case 'ITEM':
        return (
          <InventoryView 
            player={player} 
            inventory={inventory} 
            equipped={equipped} 
            onEquip={onEquip} 
            onUnequip={onUnequip} 
            toggleLock={toggleLock}
          />
        );
      
      case 'ACHIEVEMENT':
        return <DashboardView player={player} />;
      
      case 'ARENA': 
        if (isGuest) return <HomeView />;
        return (
          <ArenaView 
            player={player} 
            equipped={equipped} 
            userId={player.id || 'guest'}
            onStartMatch={onStartArena} 
          />
        );

      case 'QUEST':
        return <PlaceholderView title="クエスト" icon={<FileText size={48}/>} />;
      
      case 'INFO':
        return <PlaceholderView title="お知らせ" icon={<Megaphone size={48}/>} />;
      
      default:
        return <HomeView />;
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
        isGuest={isGuest} // 追加: サイドバーへ渡す
      />
    </div>
  );
};

export default TownScreen;