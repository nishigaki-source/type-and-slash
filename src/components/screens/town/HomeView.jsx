import React from 'react';
import { SVGs } from '../../GameSvgs';
import { DIFFICULTY_SETTINGS } from '../../../constants/data';
import { Map, Lock, CheckCircle, ChevronRight } from 'lucide-react';

const HomeView = ({ player, difficulty, onMoveToDungeon }) => {
  const currentDiffData = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.EASY;
  const currentStage = player ? player.maxStage : 1;

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden">
       {/* 1. 背景画像の設定 (absoluteで背面に固定) */}
      <div 
      className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center"
      style={{
        backgroundImage: `url('/backgrounds/home_bg.png')`, // 拡張子が png であることを再確認！
      }}
    />
    {/* オーバーレイも z-1 に変更 */}
    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] z-[1]"></div>

    {/* コンテンツエリアに z-10 を追加 */}
    <div className="relative z-10 flex-1 overflow-y-auto p-6 flex flex-col items-center custom-scrollbar">
          
          {/* マップコンテナ (少し透過させて背景を活かす) */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border-2 border-slate-300 shadow-2xl max-w-2xl w-full mb-6 mt-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2 border-b pb-2 border-slate-200">
              <Map size={24} className="text-blue-600"/>
              ワールドマップ - 進行状況
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              現在の難易度: <span className="font-bold text-blue-600">{difficulty} MODE</span> ({currentDiffData.target})
            </p>

            {/* 逆ピラミッドUI */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {currentDiffData.zones.map((zone, index) => {
                const isCleared = currentStage > zone.range[1];
                const isActive = currentStage >= zone.range[0] && currentStage <= zone.range[1];
                const isLocked = currentStage < zone.range[0];
                
                const widthPercent = 100 - (index * 8);
                
                let bgClass = "bg-slate-100/50 border-slate-200 text-slate-400 opacity-60"; // Locked
                let icon = <Lock size={16} />;
                
                if (isActive) {
                  bgClass = "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-400 text-orange-900 shadow-lg transform scale-[1.03] z-10 border-2 cursor-pointer hover:brightness-95";
                  icon = <ChevronRight size={20} className="animate-pulse text-orange-600" />;
                } else if (isCleared) {
                  bgClass = "bg-blue-50/80 border-blue-200 text-blue-800 cursor-pointer hover:bg-blue-100/90 shadow-sm";
                  icon = <CheckCircle size={16} className="text-blue-500" />;
                }

                const handleClick = () => {
                  if (!isLocked && onMoveToDungeon) {
                    const targetStage = isActive ? currentStage : zone.range[0];
                    onMoveToDungeon(targetStage);
                  }
                };

                return (
                  <div 
                    key={zone.id}
                    onClick={handleClick}
                    className={`relative rounded-xl p-3.5 flex items-center justify-between transition-all duration-300 border ${bgClass}`}
                    style={{ width: `${widthPercent}%`, minWidth: '300px' }}
                    title={isLocked ? "まだ挑戦できません" : "クリックしてダンジョンへ"}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-black text-sm sm:text-base whitespace-nowrap tracking-tighter">
                        {zone.name}
                      </div>
                      <div className="text-[10px] font-mono bg-white/60 px-2 py-0.5 rounded-full border border-slate-200">
                        B{zone.range[0]}F - B{zone.range[1]}F
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {!isLocked && (
                        <div className="hidden sm:block text-xs opacity-80 text-right mr-2 leading-tight">
                          <div className="font-bold text-slate-600">推奨 Lv.{zone.range[0] * 2 - 1}〜</div>
                          <div className="text-[9px] font-medium text-slate-500">{zone.features}</div>
                        </div>
                      )}
                      
                      <div className="flex-shrink-0">
                        {isActive && (
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-sm shadow-md animate-bounce">
                            HERE
                          </div>
                        )}
                        {icon}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 下部メッセージ */}
          {player && (
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center text-sm text-white shadow-2xl max-w-md animate-fade-in">
              {currentStage > 100 ? (
                <span className="text-yellow-400 font-bold flex items-center justify-center gap-2 text-lg">
                  <CheckCircle size={24} /> 全階層制覇！
                </span>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Current Floor</span>
                  <span className="font-black text-4xl text-blue-400 drop-shadow-sm font-mono">B{currentStage}F</span>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-1000" 
                      style={{ width: `${(currentStage % 10 || 10) * 10}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 italic">
                    Next Boss: B{Math.ceil(currentStage / 10) * 10}F
                  </span>
                </div>
              )}
            </div>
          )}
       </div>
    </div>
  );
};

export default HomeView;