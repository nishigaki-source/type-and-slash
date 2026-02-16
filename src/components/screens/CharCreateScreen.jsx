import React, { useState } from 'react';
import { Feather, LogOut, ArrowRight, Dices, Info } from 'lucide-react';
import { SVGs } from '../GameSvgs';
import { JOBS, RACES } from '../../constants/data'; // PERSONALITIESを除外
import { generateRandomName } from '../../utils/gameLogic';

// 相性図コンポーネント (レスポンシブ対応版)
const RelationDiagram = () => (
  <div className="bg-white/90 p-4 rounded-lg border-2 border-slate-300 mb-4 text-xs text-slate-600 shadow-sm">
    <h3 className="font-bold text-center mb-4 text-slate-700 flex items-center justify-center gap-2 border-b border-slate-200 pb-2">
      <Info size={16} className="text-blue-500"/> 戦闘相性 (ダメージ1.2倍)
    </h3>
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex flex-col items-center w-full">
        <div className="font-bold mb-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">職業の相性</div>
        <div className="w-full max-w-[200px] aspect-[5/4]">
          <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
              </marker>
            </defs>
            <g transform="translate(100, 20)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">ファイター</text></g>
            <g transform="translate(185, 80)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">アーチャー</text></g>
            <g transform="translate(100, 145)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">モンク</text></g>
            <g transform="translate(15, 80)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">メイジ</text></g>
            <path d="M125,25 L160,60" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M160,95 L125,130" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M75,130 L40,95" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M40,60 L75,25" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          </svg>
        </div>
      </div>
      <div className="w-3/4 h-px bg-slate-200"></div>
      <div className="flex flex-col items-center w-full">
        <div className="font-bold mb-2 text-purple-600 bg-purple-50 px-3 py-1 rounded-full">種族の相性</div>
        <div className="w-full max-w-[200px] aspect-[5/4]">
          <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
            <g transform="translate(100, 20)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">人間</text></g>
            <g transform="translate(185, 80)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">エルフ</text></g>
            <g transform="translate(100, 145)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">魔族</text></g>
            <g transform="translate(15, 80)"><text x="0" y="0" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="13">ドワーフ</text></g>
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
  // 性格(personality)を削除
  const [form, setForm] = useState({ name: '冒険者', job: 'FIGHTER', race: 'HUMAN', gender: 'MALE' });

  const handleRandomName = () => {
    setForm({...form, name: generateRandomName()});
  };

  // 選択に応じた画像パスを生成 (public/character/種族_性別_職業.png)
  const getCharacterImagePath = () => {
    return `/character/${form.race.toLowerCase()}_${form.gender.toLowerCase()}_${form.job.toLowerCase()}.png`;
  };

  return (
    <div className="w-full h-full relative overflow-y-auto text-slate-800 bg-slate-50 font-sans">
      <div className="fixed inset-0 opacity-10 pointer-events-none">
         <SVGs.GuildBg />
      </div>
      
      <div className="min-h-full p-4 md:p-8 flex items-start justify-center relative z-10">
        <div className="max-w-6xl w-full bg-[#fdf6e3]/95 backdrop-blur-sm rounded shadow-2xl p-6 md:p-8 border-4 border-[#8b5cf6] my-8">
          
          <div className="text-center mb-8 border-b-2 border-[#8b5cf6]/30 pb-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#4c1d95] flex items-center justify-center gap-3">
              <Feather size={32} /> 冒険者ギルド 新規登録
            </h2>
            <p className="text-[#6d28d9] mt-2 font-serif italic text-sm md:text-base">Adventurer's Guild Registration Form</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              
              {/* キャラクタープレビュー (選択に応じて画像が変化) */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center">
                <label className="block w-full text-sm font-bold text-[#5b21b6] mb-4 flex items-center gap-2">
                  <span className="w-2 h-4 bg-[#8b5cf6] rounded-full"></span> 外見 (Appearance)
                </label>
                <div className="w-48 h-48 bg-slate-100 rounded-2xl border-4 border-[#ddd6fe] overflow-hidden flex items-center justify-center shadow-inner relative">
                  <img 
                    src={getCharacterImagePath()} 
                    alt="Character Preview" 
                    className="w-full h-full object-contain image-pixelated"
                    onError={(e) => {
                      // 画像がない場合のフォールバックとしてSVGsを表示
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }} className="w-full h-full">
                    {React.createElement(JOBS[form.job].Illustration, { gender: form.gender, race: form.race })}
                  </div>
                </div>
              </div>

              {/* 名前 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <label className="block text-sm font-bold text-[#5b21b6] mb-2 flex items-center gap-2">
                  <span className="w-2 h-4 bg-[#8b5cf6] rounded-full"></span> 冒険者名 (Name)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="flex-1 bg-slate-50 border-2 border-[#ddd6fe] rounded-lg p-3 text-slate-800 focus:outline-none focus:border-[#8b5cf6] font-serif text-lg"
                    maxLength={10}
                  />
                  <button onClick={handleRandomName} className="bg-[#8b5cf6] text-white px-4 rounded-lg hover:bg-[#7c3aed] flex flex-col items-center justify-center text-xs font-bold transition-all active:scale-95">
                    <Dices size={20} className="mb-1" /> おまかせ
                  </button>
                </div>
              </div>

              {/* 種族 & 性別 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#5b21b6] mb-2">種族 (Race)</label>
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

                <div>
                  <label className="block text-sm font-bold text-[#5b21b6] mb-2">性別 (Gender)</label>
                  <div className="flex gap-2">
                    {['MALE', 'FEMALE'].map(g => (
                      <button
                        key={g}
                        onClick={() => setForm({...form, gender: g})}
                        className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${form.gender === g ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'bg-white text-[#6d28d9] border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                      >
                        {g === 'MALE' ? '男性' : '女性'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 職業 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <label className="block text-sm font-bold text-[#5b21b6] mb-3">職業 (Class)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(JOBS).map(key => {
                    const isSelected = form.job === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setForm({...form, job: key})}
                        className={`p-3 rounded-xl border-2 flex items-center gap-4 transition-all ${isSelected ? 'bg-[#f3e8ff] border-[#8b5cf6] shadow-md ring-2 ring-[#8b5cf6]' : 'bg-white border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                      >
                        <div className="text-left flex-1">
                          <div className={`font-bold text-base ${isSelected ? 'text-[#6d28d9]' : 'text-slate-600'}`}>{JOBS[key].name}</div>
                          <div className="text-xs text-slate-500">得意: {Object.entries(JOBS[key].growth).filter(([k,v]) => v === 'S' || v === 'A').map(([k]) => k.toUpperCase()).join(', ')}</div>
                        </div>
                        {isSelected && <div className="text-[#8b5cf6]"><ArrowRight size={20}/></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col">
              <RelationDiagram />
              <div className="flex-1"></div>
              <div className="flex flex-col gap-4 mt-6 bg-[#fdf6e3] pt-4 lg:static">
                <button 
                  onClick={() => onCreate(form)}
                  className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white rounded-xl font-bold text-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 border border-[#5b21b6]"
                >
                  <span>登録して冒険へ</span> <ArrowRight className="animate-pulse" />
                </button>
                <button onClick={onBack} className="w-full py-3 bg-slate-500 text-white rounded-xl font-bold shadow-md hover:bg-slate-600 transition-all flex items-center justify-center gap-2">
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