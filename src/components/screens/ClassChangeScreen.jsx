import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { SVGs } from '../GameSvgs';
import { JOBS } from '../../constants/data';

const ClassChangeScreen = ({ player, onChangeClass, onBack }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  const COST = 1000;
  const canAfford = player.gold >= COST;

  const handleConfirm = () => {
    if (!selectedJob) return;
    if (!canAfford) {
      alert('ゴールドが足りません！');
      return;
    }
    if (window.confirm(`本当に ${JOBS[selectedJob].name} に転職しますか？\n(費用: ${COST} G, 武器は外れます, ステータスは再計算されます)`)) {
      onChangeClass(selectedJob, COST);
    }
  };

  return (
    <div className="h-full relative overflow-y-auto text-slate-800 bg-slate-50">
       <SVGs.GuildBg />
       
       <div className="min-h-full p-8 flex items-center justify-center">
         <div className="max-w-4xl w-full bg-[#fdf6e3] rounded-sm shadow-2xl p-8 border-4 border-[#8b5cf6] relative">
            <div className="text-center mb-6 border-b-2 border-[#8b5cf6] pb-4">
               <h2 className="text-4xl font-serif font-bold text-[#4c1d95] flex items-center justify-center gap-3">
                 <GraduationCap size={32} /> 職業変更手続き
               </h2>
               <p className="text-[#6d28d9] mt-2 font-serif italic">Class Change Service - Fee: {COST} G</p>
            </div>

            <div className="flex justify-between items-center mb-6 bg-white/50 p-4 rounded border border-[#ddd6fe]">
               <div className="font-bold text-[#5b21b6]">現在の所持金: <span className="text-xl">{player.gold} G</span></div>
               <div className="font-bold text-[#5b21b6]">現在の職業: <span className="text-xl">{JOBS[player.job].name}</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               {Object.keys(JOBS).map(key => {
                 const JobIll = JOBS[key].Illustration;
                 const isCurrent = player.job === key;
                 const isSelected = selectedJob === key;
                 
                 if (isCurrent) return null; // 現在の職は表示しない（または無効化）

                 return (
                   <button
                     key={key}
                     onClick={() => setSelectedJob(key)}
                     className={`p-4 rounded-lg border-2 flex flex-col items-center gap-3 transition-all ${isSelected ? 'bg-[#f3e8ff] border-[#8b5cf6] shadow-lg scale-105' : 'bg-white border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                   >
                     <div className="w-20 h-20 bg-slate-100 rounded-full border-2 border-slate-200 overflow-hidden">
                        <JobIll gender={player.gender} race={player.race} />
                     </div>
                     <div className="font-bold text-lg text-[#6d28d9]">{JOBS[key].name}</div>
                     <div className="text-xs text-slate-500 text-center">
                        得意ステータス:<br/>
                        {Object.entries(JOBS[key].growth).filter(([k,v]) => v === 'S' || v === 'A').map(([k]) => k.toUpperCase()).join(', ')}
                     </div>
                   </button>
                 );
               })}
            </div>

            <div className="flex justify-center gap-4">
               <button 
                 onClick={onBack}
                 className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded font-bold"
               >
                 キャンセル
               </button>
               <button 
                 onClick={handleConfirm}
                 disabled={!selectedJob || !canAfford}
                 className={`px-12 py-3 rounded font-bold text-xl shadow-lg transition-all flex items-center gap-2 ${(!selectedJob || !canAfford) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white transform hover:scale-105'}`}
               >
                 転職する
               </button>
            </div>
         </div>
       </div>
    </div>
  );
};

export default ClassChangeScreen;