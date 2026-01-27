import React, { useState } from 'react';
import { Feather, LogOut, ArrowRight, Dices, Info } from 'lucide-react';
import { SVGs } from '../GameSvgs';
import { JOBS, RACES, PERSONALITIES } from '../../constants/data';
import { generateRandomName } from '../../utils/gameLogic';

// 相性図コンポーネント (レスポンシブ対応版)
const RelationDiagram = () => (
  <div className="bg-white/90 p-4 rounded-lg border-2 border-slate-300 mb-4 text-xs text-slate-600 shadow-sm">
    <h3 className="font-bold text-center mb-4 text-slate-700 flex items-center justify-center gap-2 border-b border-slate-200 pb-2">
      <Info size={16} className="text-blue-500"/> 戦闘相性 (ダメージ1.2倍)
    </h3>
    
    <div className="flex flex-col gap-8 items-center w-full">
      
      {/* 1. 職業の相性 (4すくみ) */}
      <div className="flex flex-col items-center w-full">
        <div className="font-bold mb-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">職業の相性</div>
        <div className="w-full max-w-[240px] aspect-[5/4]">
          <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
              </marker>
            </defs>
            
            {/* ノード */}
            <g transform="translate(100, 20)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">ファイター</text></g>
            <g transform="translate(185, 80)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">アーチャー</text></g>
            <g transform="translate(100, 145)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">モンク</text></g>
            <g transform="translate(15, 80)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">メイジ</text></g>

            {/* 矢印 (時計回り) */}
            <path d="M125,25 L160,60" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M160,95 L125,130" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M75,130 L40,95" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M40,60 L75,25" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          </svg>
        </div>
      </div>

      {/* 区切り線 */}
      <div className="w-3/4 h-px bg-slate-200"></div>

      {/* 2. 種族の相性 (4すくみ) */}
      <div className="flex flex-col items-center w-full">
        <div className="font-bold mb-2 text-purple-600 bg-purple-50 px-3 py-1 rounded-full">種族の相性</div>
        <div className="w-full max-w-[240px] aspect-[5/4]">
          <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
            {/* ノード (時計回りに配置) */}
            <g transform="translate(100, 20)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">人間</text></g>
            <g transform="translate(185, 80)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">エルフ</text></g>
            <g transform="translate(100, 145)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">魔族</text></g>
            <g transform="translate(15, 80)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">ドワーフ</text></g>

            {/* 矢印 (時計回り: 人間->エルフ->魔族->ドワーフ->人間) */}
            <path d="M125,25 L160,60" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M160,95 L125,130" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M75,130 L40,95" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M40,60 L75,25" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const CharCreateScreen = ({ onCreate, onBack }) => {
  const [form, setForm] = useState({ name: '冒険者', job: 'FIGHTER', race: 'HUMAN', gender: 'MALE', personality: 'BRAVE' });

  const handleRandomName = () => {
    setForm({...form, name: generateRandomName()});
  };

  return (
    <div className="h-full relative overflow-y-auto text-slate-800 bg-slate-50 font-sans">
      {/* 背景パターン */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
         <SVGs.GuildBg />
      </div>
      
      <div className="min-h-full p-4 md:p-8 flex items-center justify-center relative z-10">
        <div className="max-w-6xl w-full bg-[#fdf6e3]/95 backdrop-blur-sm rounded shadow-2xl p-6 md:p-8 border-4 border-[#8b5cf6]">
          
          {/* ヘッダー */}
          <div className="text-center mb-8 border-b-2 border-[#8b5cf6]/30 pb-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#4c1d95] flex items-center justify-center gap-3">
              <Feather size={32} /> 冒険者ギルド 新規登録
            </h2>
            <p className="text-[#6d28d9] mt-2 font-serif italic text-sm md:text-base">Adventurer's Guild Registration Form</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 左カラム: 入力フォーム (幅広) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 名前 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <label className="block text-sm font-bold text-[#5b21b6] mb-2 flex items-center gap-2">
                  <span className="w-2 h-4 bg-[#8b5cf6] rounded-full"></span> 氏名 (Name)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="flex-1 bg-slate-50 border-2 border-[#ddd6fe] rounded-lg p-3 text-slate-800 focus:outline-none focus:border-[#8b5cf6] font-serif text-lg transition-colors"
                    maxLength={10}
                    placeholder="名前を入力"
                  />
                  <button 
                    onClick={handleRandomName}
                    className="bg-[#8b5cf6] text-white px-4 rounded-lg hover:bg-[#7c3aed] transition-colors shadow-md active:scale-95 flex flex-col items-center justify-center text-xs font-bold"
                    title="ランダム生成"
                  >
                    <Dices size={20} className="mb-1" /> おまかせ
                  </button>
                </div>
              </div>

              {/* 種族 & 性別 & 性格 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#5b21b6] mb-2 flex items-center gap-2">
                    <span className="w-2 h-4 bg-[#8b5cf6] rounded-full"></span> 種族 (Race)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.keys(RACES).map(key => (
                      <button
                        key={key}
                        onClick={() => setForm({...form, race: key})}
                        className={`py-3 px-2 rounded-lg border-2 text-sm font-bold transition-all ${form.race === key ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-md scale-[1.02]' : 'bg-white text-[#6d28d9] border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                      >
                        {RACES[key].name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#5b21b6] mb-2">性別 (Gender)</label>
                    <div className="flex gap-2">
                      {['MALE', 'FEMALE'].map(g => (
                        <button
                          key={g}
                          onClick={() => setForm({...form, gender: g})}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold transition-all ${form.gender === g ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'bg-white text-[#6d28d9] border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                        >
                          {g === 'MALE' ? '男性' : '女性'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#5b21b6] mb-2">性格 (Nature)</label>
                    <select 
                      value={form.personality} 
                      onChange={e => setForm({...form, personality: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-[#ddd6fe] rounded-lg p-2.5 text-slate-800 font-bold text-sm focus:outline-none focus:border-[#8b5cf6]"
                    >
                      {Object.keys(PERSONALITIES).map(key => (
                        <option key={key} value={key}>{PERSONALITIES[key].name} ({PERSONALITIES[key].bonusStat.toUpperCase()}重視)</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 職業 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <label className="block text-sm font-bold text-[#5b21b6] mb-3 flex items-center gap-2">
                  <span className="w-2 h-4 bg-[#8b5cf6] rounded-full"></span> 職業 (Class)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(JOBS).map(key => {
                    const JobIll = JOBS[key].Illustration;
                    const isSelected = form.job === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setForm({...form, job: key})}
                        className={`p-3 rounded-xl border-2 flex items-center gap-4 transition-all ${isSelected ? 'bg-[#f3e8ff] border-[#8b5cf6] shadow-md ring-2 ring-[#8b5cf6] ring-offset-1' : 'bg-white border-[#ddd6fe] hover:bg-[#f5f3ff] hover:border-[#8b5cf6]/50'}`}
                      >
                        <div className={`w-14 h-14 flex-shrink-0 rounded-full p-1 overflow-hidden border-2 bg-slate-100 ${isSelected ? 'border-[#7c3aed]' : 'border-slate-300'}`}>
                          <div className={isSelected ? '' : 'opacity-70 grayscale'}>
                            <JobIll gender={form.gender} race={form.race} />
                          </div>
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className={`font-bold text-base ${isSelected ? 'text-[#6d28d9]' : 'text-slate-600'}`}>{JOBS[key].name}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            得意: {Object.entries(JOBS[key].growth).filter(([k,v]) => v === 'S' || v === 'A').map(([k]) => k.toUpperCase()).join(', ')}
                          </div>
                        </div>
                        {isSelected && <div className="text-[#8b5cf6]"><ArrowRight size={20}/></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 右カラム: 相性図 & アクションボタン */}
            <div className="lg:col-span-4 flex flex-col h-full">
              {/* 相性図 */}
              <RelationDiagram />

              <div className="flex-1"></div>

              {/* ボタンエリア */}
              <div className="flex flex-col gap-4 mt-6 sticky bottom-0 bg-[#fdf6e3] pt-4 lg:static lg:bg-transparent">
                <button 
                  onClick={() => onCreate(form)}
                  className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#5b21b6] text-white rounded-xl font-bold text-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 border border-[#5b21b6]"
                >
                  <span>登録して冒険へ</span> <ArrowRight className="animate-pulse" />
                </button>
                <button 
                  onClick={onBack}
                  className="w-full py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 border border-slate-600"
                >
                  <LogOut size={18} /> タイトルへ戻る
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CharCreateScreen;