import React from 'react';
import { 
  ShoppingBag, Mail, Trophy, FileText, 
  Megaphone, User, LogOut, Sword, Backpack, 
  ArrowLeftRight, Coins, Swords, Lock
} from 'lucide-react';
import { JOBS } from '../../../constants/data';

// MenuButtonコンポーネントを拡張してdisabledに対応
const MenuButton = ({ icon, label, onClick, active = false, color = "bg-slate-800 hover:bg-slate-700", disabled = false }) => (
  <button 
    onClick={disabled ? null : onClick}
    className={`
      aspect-square flex flex-col items-center justify-center gap-2 rounded-lg border transition-all duration-200
      ${active ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 
        disabled ? 'bg-slate-800/50 border-slate-700/50 text-slate-600 cursor-not-allowed' : 
        `${color} border-slate-700 text-slate-300`}
    `}
    title={disabled ? "ログインが必要です" : ""}
  >
    <div className={active ? 'animate-bounce-slow' : ''}>
      {disabled ? <Lock size={24} className="opacity-50"/> : icon}
    </div>
    <span className={`text-xs font-bold ${disabled ? 'text-slate-600' : ''}`}>{label}</span>
  </button>
);

const MenuSidebar = ({ player, activeView, setActiveView, onLogout, difficulty, isGuest }) => {
  const JobIll = JOBS[player.job].Illustration;
  const expPercent = player.level > 0 ? Math.min(100, Math.floor((player.exp / (player.level * 100)) * 100)) : 0;

  const diffLabel = difficulty === 'EASY' ? 'かんたん' : difficulty === 'NORMAL' ? 'ふつう' : 'むずかしい';

  return (
    <div className="w-[320px] bg-slate-900 border-l border-slate-700 flex flex-col text-white shadow-2xl z-10">
      {/* プレイヤー情報ヘッダー */}
      <div className="p-4 bg-slate-800 border-b border-slate-700">
         <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-slate-700 rounded-full border-2 border-slate-500 overflow-hidden">
               <JobIll gender={player.gender} race={player.race} />
            </div>
            <div className="flex-1 min-w-0">
               <div className="font-bold text-sm truncate">{player.name}</div>
               <div className="text-xs text-slate-400">Lv.{player.level}</div>
            </div>
            <div className="text-xs px-2 py-1 bg-slate-700 rounded border border-slate-600 text-slate-300">
               {diffLabel}
            </div>
         </div>
         
         <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2 border border-slate-700 relative group">
            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${expPercent}%` }}></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-mono">EXP {expPercent}%</div>
         </div>

         <div className="flex justify-end items-center gap-1 text-yellow-400 font-mono font-bold">
            <Coins size={14} /> {player.gold.toLocaleString()}
         </div>
      </div>

      {/* 3x3 メニューグリッド */}
      <div className="p-2 flex-1 overflow-y-auto flex flex-col">
         <div className="grid grid-cols-3 gap-2 content-start mb-auto">
            {/* 上段 */}
            <MenuButton icon={<ShoppingBag size={24} />} label="ショップ" onClick={() => setActiveView('SHOP')} active={activeView === 'SHOP'} />
            <MenuButton icon={<Backpack size={24} />} label="アイテム" onClick={() => setActiveView('ITEM')} active={activeView === 'ITEM'} />
            
            {/* トレードボタン (ゲスト時は無効化) */}
            <MenuButton 
              icon={<ArrowLeftRight size={24} />} 
              label="トレード" 
              onClick={() => setActiveView('TRADE')} 
              active={activeView === 'TRADE'} 
              color="bg-green-800/40 hover:bg-green-800/60 border-green-900" 
              disabled={isGuest}
            />
            
            {/* 中段 */}
            <MenuButton icon={<Sword size={24} />} label="ダンジョン" onClick={() => setActiveView('DUNGEON')} active={activeView === 'DUNGEON'} color="bg-red-900/40 hover:bg-red-900/60 border-red-900" />
            <MenuButton icon={<FileText size={24} />} label="クエスト" onClick={() => setActiveView('QUEST')} active={activeView === 'QUEST'} />
            <MenuButton icon={<Trophy size={24} />} label="実績" onClick={() => setActiveView('ACHIEVEMENT')} active={activeView === 'ACHIEVEMENT'} />
            
            {/* 下段 */}
            <MenuButton icon={<User size={24} />} label="ステータス" onClick={() => setActiveView('STATUS')} active={activeView === 'STATUS'} />
            
            {/* アリーナボタン (ゲスト時は無効化) */}
            <MenuButton 
              icon={<Swords size={24} />} 
              label="アリーナ" 
              onClick={() => setActiveView('ARENA')} 
              active={activeView === 'ARENA'} 
              color="bg-purple-900/40 hover:bg-purple-900/60 border-purple-900" 
              disabled={isGuest} 
            />
            
            <MenuButton icon={<Megaphone size={24} />} label="お知らせ" onClick={() => setActiveView('INFO')} active={activeView === 'INFO'} />
         </div>
         
         {/* ログアウトボタン */}
         <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
           <button onClick={() => setActiveView('HOME')} className={`w-full py-2 rounded text-sm font-bold transition-colors ${activeView === 'HOME' ? 'text-slate-500 cursor-default' : 'text-blue-400 hover:text-blue-300 hover:bg-slate-800'}`}>HOME</button>
           <button onClick={onLogout} className="w-full py-2 rounded text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"><LogOut size={16}/> ログアウト</button>
         </div>
      </div>
    </div>
  );
};

export default MenuSidebar;