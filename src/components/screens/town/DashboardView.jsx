import React from 'react';
import { Trophy, Activity, BarChart2, Keyboard, Swords } from 'lucide-react';

const DashboardView = ({ player }) => {
  const rec = player.records || { totalTypes:0, totalMiss:0, dungeonClears:0, arenaChallenges:0, missedWords:{}, missedKeys:{}, daily:{} };
  const totalTypes = rec.totalTypes;
  const totalMiss = rec.totalMiss;
  const missRate = totalTypes > 0 ? ((totalMiss / (totalTypes + totalMiss)) * 100).toFixed(1) : 0;
  
  const totalPlayTimeMs = Object.values(rec.daily || {}).reduce((acc,cur)=>acc+(cur.time || 0),0);
  const avgCPM = totalPlayTimeMs > 0 ? (totalTypes / (totalPlayTimeMs/60000)).toFixed(1) : 0;
  
  const worstWords = Object.entries(rec.missedWords || {})
    .sort((a,b) => b[1] - a[1])
    .slice(0, 3);

  const worstKeys = Object.entries(rec.missedKeys || {})
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5);

  // グラフ用データ (直近14日分)
  const today = new Date();
  const graphData = [];
  for(let i=13; i>=0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayData = (rec.daily && rec.daily[dateStr]) || { clears: 0, arenaChallenges: 0, types: 0, time: 0 };
    const dayCPM = dayData.time > 0 ? (dayData.types / (dayData.time/60000)) : 0;
    const displayDate = `${d.getMonth() + 1}/${d.getDate()}`;
    graphData.push({ 
      date: displayDate, 
      clears: dayData.clears || 0,
      arena: dayData.arenaChallenges || 0,
      cpm: dayCPM 
    });
  }

  // グラフの最大値計算（積み上げ合計）
  const maxActivities = Math.max(5, ...graphData.map(d => d.clears + d.arena));
  const maxCPM = Math.max(100, ...graphData.map(d => d.cpm));

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800"><Activity /> 実績ダッシュボード</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">総タイピング数</div>
            <div className="text-2xl font-bold text-blue-600">{totalTypes.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">総ミスタイプ数</div>
            <div className="text-2xl font-bold text-red-500">{totalMiss.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">ミスタイプ率</div>
            <div className="text-2xl font-bold text-slate-700">{missRate}%</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">平均タイプ速度 (文字/分)</div>
            <div className="text-2xl font-bold text-green-600">{avgCPM}</div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">ダンジョン探索回数</div>
            <div className="text-2xl font-bold text-yellow-600">{rec.dungeonClears} 回</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">アリーナ挑戦回数</div>
            <div className="text-2xl font-bold text-purple-600">{rec.arenaChallenges || 0} 回</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2"><Trophy size={16}/> 苦手ワード Top3</h3>
            <div className="space-y-2">
              {worstWords.length === 0 && <div className="text-xs text-slate-400">データがありません</div>}
              {worstWords.map(([word, count], i) => (
                <div key={word} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${i===0?'bg-yellow-100 text-yellow-700':i===1?'bg-slate-200 text-slate-600':'bg-orange-100 text-orange-700'}`}>{i+1}</span>
                    <span className="font-bold text-slate-700">{word}</span>
                  </div>
                  <span className="text-xs text-red-500 font-mono">{count} miss</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2"><Keyboard size={16}/> 苦手キー Top5</h3>
            <div className="flex gap-2 flex-wrap">
              {worstKeys.length === 0 && <div className="text-xs text-slate-400">データがありません</div>}
              {worstKeys.map(([key, count], i) => (
                <div key={key} className="flex flex-col items-center bg-white p-2 rounded border border-slate-200 shadow-sm min-w-[3rem]">
                  <span className="text-lg font-bold text-slate-800">{key}</span>
                  <span className="text-[10px] text-red-500 font-mono">{count}回</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><BarChart2 size={16}/> 成長記録 (直近14日)</h3>
          
          <div className="mb-6">
            <div className="text-xs text-slate-400 mb-2 text-center flex justify-center gap-4">
               <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span>ダンジョン</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span>アリーナ</span>
            </div>
            <div className="flex items-end justify-between h-32 gap-1 border-b border-slate-100 pb-1">
              {graphData.map((d, i) => {
                const total = d.clears + d.arena;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative justify-end h-full">
                    {/* アリーナ（赤） */}
                    <div 
                      className="w-full bg-red-400 rounded-t-sm hover:bg-red-500 transition-all relative"
                      style={{ height: `${total > 0 ? (d.arena / maxActivities) * 100 : 0}%` }}
                    />
                    {/* ダンジョン（緑） */}
                    <div 
                      className="w-full bg-green-400 rounded-b-sm hover:bg-green-500 transition-all relative"
                      style={{ height: `${total > 0 ? (d.clears / maxActivities) * 100 : 0}%` }}
                    />
                    
                    {/* ツールチップ */}
                    {total > 0 && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[8px] bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap">
                        D:{d.clears} / A:{d.arena}
                      </div>
                    )}
                    <div className="text-[8px] text-slate-400 mt-1 transform -rotate-90 origin-top-left h-6 overflow-visible whitespace-nowrap translate-y-6">{d.date}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <div className="text-xs text-slate-400 mb-2 text-center">平均タイプ速度 (CPM)</div>
            <div className="relative h-32 w-full border-l border-b border-slate-100">
               <div className="absolute inset-0 flex justify-between items-end">
                 {graphData.map((d, i) => (
                   <div key={i} className="flex-1 flex justify-center h-full relative group">
                      <div 
                        className="w-2 h-2 bg-blue-500 rounded-full absolute hover:scale-150 transition-transform z-10"
                        style={{ bottom: `${(d.cpm / maxCPM) * 100}%` }}
                      ></div>
                      <div className="absolute text-[8px] bg-slate-800 text-white px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 whitespace-nowrap" style={{ bottom: `${(d.cpm / maxCPM) * 100}%`, marginBottom: '8px' }}>
                        {d.cpm.toFixed(1)}
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;