import React, { useState } from 'react';
import { Feather, LogOut, ArrowRight } from 'lucide-react';
import { SVGs } from '../GameSvgs';
import { JOBS, RACES, PERSONALITIES } from '../../constants/data';

const CharCreateScreen = ({ onCreate, onBack }) => {
  const [form, setForm] = useState({ name: '冒険者', job: 'FIGHTER', race: 'HUMAN', gender: 'MALE', personality: 'BRAVE' });

  return (
    <div className="h-full relative overflow-y-auto text-slate-800 bg-slate-50">
      <SVGs.GuildBg />
      
      <div className="min-h-full p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-[#fdf6e3] rounded-sm shadow-2xl p-8 border-4 border-[#8b5cf6] relative">
          <div className="text-center mb-8 border-b-2 border-[#8b5cf6] pb-4">
            <h2 className="text-4xl font-serif font-bold text-[#4c1d95] flex items-center justify-center gap-3">
              <Feather size={32} /> 冒険者ギルド 新規登録
            </h2>
            <p className="text-[#6d28d9] mt-2 font-serif italic">Adventurer's Guild Registration Form</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#5b21b6] mb-1">氏名 (Name)</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white border-2 border-[#ddd6fe] rounded p-2 text-slate-800 focus:outline-none focus:border-[#8b5cf6] font-serif text-lg shadow-inner"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#5b21b6] mb-2">種族 (Race)</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(RACES).map(key => (
                    <button
                      key={key}
                      onClick={() => setForm({...form, race: key})}
                      className={`py-2 px-3 rounded border-2 text-sm font-bold transition-all ${form.race === key ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-md' : 'bg-white text-[#6d28d9] border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                    >
                      {RACES[key].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#5b21b6] mb-2">性別 (Gender)</label>
                  <div className="flex gap-2">
                    {['MALE', 'FEMALE'].map(g => (
                      <button
                        key={g}
                        onClick={() => setForm({...form, gender: g})}
                        className={`flex-1 py-2 rounded border-2 text-sm font-bold transition-all ${form.gender === g ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'bg-white text-[#6d28d9] border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
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
                    className="w-full bg-white border-2 border-[#ddd6fe] rounded p-2 text-slate-800 font-bold"
                  >
                    {Object.keys(PERSONALITIES).map(key => (
                      <option key={key} value={key}>{PERSONALITIES[key].name} ({PERSONALITIES[key].bonusStat.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-sm font-bold text-[#5b21b6] mb-2">職業 (Class)</label>
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(JOBS).map(key => {
                  const JobIll = JOBS[key].Illustration;
                  const isSelected = form.job === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setForm({...form, job: key})}
                      className={`p-3 rounded-lg border-2 flex items-center gap-4 transition-all ${isSelected ? 'bg-[#f3e8ff] border-[#8b5cf6] shadow-md scale-[1.02]' : 'bg-white border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                    >
                      <div className={`w-16 h-16 flex-shrink-0 rounded-full p-1 overflow-hidden border-2 ${isSelected ? 'bg-[#8b5cf6] border-[#7c3aed]' : 'bg-slate-200 border-slate-300'}`}>
                        {isSelected ? <JobIll gender={form.gender} race={form.race} /> : <div className="opacity-50"><JobIll gender={form.gender} race={form.race} /></div>}
                      </div>
                      <div className="text-left flex-1">
                        <div className={`font-bold text-lg ${isSelected ? 'text-[#6d28d9]' : 'text-slate-600'}`}>{JOBS[key].name}</div>
                        <div className="text-xs text-slate-500">得意: {Object.entries(JOBS[key].growth).filter(([k,v]) => v === 'S' || v === 'A').map(([k]) => k.toUpperCase()).join(', ')}</div>
                      </div>
                      {isSelected && <div className="text-[#8b5cf6]"><div className="w-4 h-4 bg-[#8b5cf6] rounded-full"></div></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 border-4 border-gray-400"
            >
              <LogOut size={24} /> タイトルへ
            </button>
            <button 
              onClick={() => onCreate(form)}
              className="px-12 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 border-4 border-[#ddd6fe]"
            >
              登録して冒険へ <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharCreateScreen;