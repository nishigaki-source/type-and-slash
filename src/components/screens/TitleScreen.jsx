import React from 'react';
import { Settings, Gamepad2, Sword, Play } from 'lucide-react';

const TitleScreen = ({ 
  player, onStartNew, onResume, 
  difficulty, setDifficulty, 
  onGuestMultiplayer
}) => {

  // 難易度ボタンのスタイル（ダークテーマ用）
  const getDiffBtnClass = (mode) => {
    const isActive = difficulty === mode;
    const baseClass = "flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 border";
    
    if (isActive) {
      return `${baseClass} bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transform scale-105 z-10`;
    }
    return `${baseClass} bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600`;
  };

  // 難易度ラベル
  const diffLabels = {
    'EASY': 'かんたん',
    'NORMAL': 'ふつう',
    'HARD': 'むずかしい'
  };

  return (
    <div className="w-full h-full text-white relative overflow-hidden bg-slate-900">
      
      {/* 1. 指定の背景画像設定 */}
      <div 
      className="absolute inset-0 z-0 bg-no-repeat bg-cover animate-pulse-slow"
      style={{
        backgroundImage: `url('/backgrounds/title_bg.png')`,
        backgroundPosition: 'center',
        transform: 'scale(1.05)',
      }}
    />

      {/* 2. 背景を暗くし、ブラー（ぼかし）をかけてUIの視認性を上げるオーバーレイ */}
      <div className="absolute inset-0 z-0 bg-slate-900/20 backdrop-blur-[0px]" />

      {/* 装飾用背景エフェクト（従来の放射状グラデーションも活かす） */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(30,58,138,0.4)_0%,transparent_60%)] animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      {/* コンテンツラッパー */}
      <div className="w-full min-h-full flex flex-col items-center py-12 relative z-10 px-4">
        
        {/* 1. タイトルロゴの上部に大きな余白（mt-20など）を追加して押し下げる */}
        <div className="w-full max-w-sm flex flex-col items-center gap-6 mt-32 md:mt-48">
        <div className="h-80" />
          
          {/* プレイヤー情報 */}
          {player && (
            <div className="text-slate-100 text-sm font-bold animate-fade-in flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Welcome back, <span className="text-blue-400">{player.name}</span> (Lv.{player.level})
            </div>
          )}

          {/* 難易度設定エリア (未ログイン時のみ表示) */}
          {!player && (
            <div className="w-full bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider mb-4">
                <Settings size={14} className="animate-spin-slow" />
                ゲームモード
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setDifficulty('EASY')} className={getDiffBtnClass('EASY')}>
                  {diffLabels.EASY}
                </button>
                <button onClick={() => setDifficulty('NORMAL')} className={getDiffBtnClass('NORMAL')}>
                  {diffLabels.NORMAL}
                </button>
                <button onClick={() => setDifficulty('HARD')} className={getDiffBtnClass('HARD')}>
                  {diffLabels.HARD}
                </button>
              </div>
            </div>
          )}

          {/* メインアクションボタン */}
          <div className="w-full space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            <button
              onClick={player ? onResume : onStartNew}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.4)] shadow-blue-900/40 border border-blue-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
            >
              {player ? <Play className="fill-current" /> : <Sword size={24} />}
              {player ? '冒険を再開する' : '冒険を始める'}
            </button>

            <button
              onClick={onGuestMultiplayer}
              className="w-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-lg font-bold py-4 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              <Gamepad2 size={24} />
              ゲストで対戦 (ロビー)
            </button>
          </div>

          {/* フッター */}
          <div className="mt-4 flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
             <div className="text-slate-400 text-xs font-mono drop-shadow-md">
                v1.2.0-SP
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TitleScreen;