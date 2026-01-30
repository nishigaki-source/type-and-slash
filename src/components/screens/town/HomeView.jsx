import React from 'react';
import { SVGs } from '../../GameSvgs';
import { DIFFICULTY_SETTINGS } from '../../../constants/data';
import { Map, Lock, CheckCircle, ChevronRight } from 'lucide-react';

const HomeView = ({ player, difficulty, onMoveToDungeon }) => {
  const currentDiffData = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.EASY;
  const currentStage = player ? player.maxStage : 1;

  return (
    <div className="h-full w-full relative flex flex-col">
       {/* 背景画像 */}
       <div className="absolute inset-0 -z-10">
         <SVGs.TownBg />
       </div>
       
       {/* 背景オーバーレイ */}
       <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] -z-10"></div>

       {/* コンテンツエリア */}
       <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          
          <div className="bg-white/90 p-4 rounded-xl border-2 border-slate-300 shadow-xl max-w-2xl w-full mb-6">
            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2 mb-2 border-b pb-2 border-slate-200">
              <Map size={24} className="text-blue-600"/>
              ワールドマップ - 進行状況
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              現在の難易度: <span className="font-bold text-blue-600">{difficulty} MODE</span> ({currentDiffData.target})
            </p>

            {/* 逆ピラミッドUI */}
            <div className="flex flex-col items-center gap-1 w-full">
              {currentDiffData.zones.map((zone, index) => {
                const isCleared = currentStage > zone.range[1];
                const isActive = currentStage >= zone.range[0] && currentStage <= zone.range[1];
                const isLocked = currentStage < zone.range[0];
                
                // 上から順に幅を狭くする (100% -> 60%)
                const widthPercent = 100 - (index * 10);
                
                let bgClass = "bg-slate-200 border-slate-300 text-slate-400"; // Locked
                let icon = <Lock size={16} />;
                
                if (isActive) {
                  bgClass = "bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-400 text-orange-800 shadow-md transform scale-[1.02] z-10 border-2 cursor-pointer hover:brightness-95";
                  icon = <ChevronRight size={20} className="animate-pulse text-orange-600" />;
                } else if (isCleared) {
                  bgClass = "bg-blue-50 border-blue-200 text-blue-700 cursor-pointer hover:bg-blue-100";
                  icon = <CheckCircle size={16} className="text-blue-500" />;
                }

                // ★クリック時の処理
                const handleClick = () => {
                  if (!isLocked && onMoveToDungeon) {
                    // そのゾーンの開始階層へジャンプするが、
                    // もし現在進行中のゾーンなら、最新の到達階層へジャンプしたほうが親切かも
                    // ここではシンプルにゾーンの開始階層または現在の階層を選択して遷移
                    const targetStage = isActive ? currentStage : zone.range[0];
                    onMoveToDungeon(targetStage);
                  }
                };

                return (
                  <div 
                    key={zone.id}
                    onClick={handleClick}
                    className={`relative rounded-lg p-3 flex items-center justify-between transition-all duration-300 border ${bgClass}`}
                    style={{ width: `${widthPercent}%`, minWidth: '320px' }}
                    title={isLocked ? "まだ挑戦できません" : "クリックしてダンジョンへ"}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-sm sm:text-base whitespace-nowrap">
                        {zone.name}
                      </div>
                      <div className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
                        B{zone.range[0]}F - B{zone.range[1]}F
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* 特徴テキスト (PC表示のみ) */}
                      {!isLocked && (
                        <div className="hidden sm:block text-xs opacity-80 text-right mr-2">
                          <div className="font-bold">推奨 Lv.{zone.range[0] * 2 - 1}~{zone.range[1] * 2 + 1}</div>
                          <div className="text-[10px]">{zone.features}</div>
                        </div>
                      )}
                      
                      {/* ステータスアイコン */}
                      <div className="flex-shrink-0">
                        {isActive && <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow animate-bounce">NOW</div>}
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
            <div className="bg-white/80 p-3 rounded-lg border border-slate-200 text-center text-sm text-slate-600 shadow-sm max-w-md">
              {currentStage > 100 ? (
                <span className="text-yellow-600 font-bold flex items-center justify-center gap-2">
                  <CheckCircle /> 全階層制覇！おめでとうございます！
                </span>
              ) : (
                <span>
                  現在の到達階層: <span className="font-bold text-xl text-blue-600">B{currentStage}F</span>
                  <br/>
                  <span className="text-xs text-slate-400">次のボスまであと {Math.max(0, 10 - (currentStage % 10 || 10) + 1)} 階層</span>
                </span>
              )}
            </div>
          )}
       </div>
    </div>
  );
};

export default HomeView;