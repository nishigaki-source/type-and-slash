import React, { useState } from 'react';
import { Settings, User, LogOut, Shield, HardDrive, Check, Copy } from 'lucide-react';
import { JOBS } from '../../../constants/data';
import { doc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../../lib/firebase';

const SettingsView = ({ player, setPlayer, difficulty, setDifficulty, onLogout }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(player.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveProfileIcon = async (jobId) => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveStatus('保存中...');
    
    try {
      const batch = writeBatch(db);
      
      // 1. 自分のメインセーブデータの更新
      const userRef = doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'saveData', 'current');
      batch.update(userRef, {
        "player.profileJob": jobId
      });

      // 2. (オプション) フレンド側のリストに表示される自分のアイコン情報を同期したい場合
      // 本来はMailView側で最新のUserデータを参照するのが正解ですが、
      // 念のため自分の基本プロフィールとして profileJob を保存します。
      
      await batch.commit();
      
      setPlayer(prev => ({ ...prev, profileJob: jobId }));
      setSaveStatus('アイコンを更新しました！');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      console.error("Icon update error:", e);
      setSaveStatus('更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const difficultyLevels = [
    { key: 'EASY', label: 'かんたん', desc: 'タイピングに慣れていない方向け。短い単語やひらがな中心に出題されます。' },
    { key: 'NORMAL', label: 'ふつう', desc: '一般的な難易度。漢字や日常的な単語、少し長めの文章が出題されます。' },
    { key: 'HARD', label: 'むずかしい', desc: '熟練者向け。英単語、記号、プログラミング構文など複雑な入力が求められます。' }
  ];

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="text-blue-600" /> 設定
        </h2>
        {saveStatus && (
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse">
            {saveStatus}
          </span>
        )}
      </div>

      <div className="space-y-6 overflow-y-auto pb-10 no-scrollbar">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
            <User size={16} /> プロフィールアイコン選択
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 justify-items-center">
            {Object.keys(JOBS).map((jobId) => {
              const JobIll = JOBS[jobId].Illustration;
              const isSelected = (player.profileJob || player.job) === jobId;
              return (
                <button
                  key={jobId}
                  onClick={() => saveProfileIcon(jobId)}
                  disabled={isSaving}
                  className={`relative w-16 h-16 p-1 rounded-full border-4 transition-all flex items-center justify-center ${
                    isSelected ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent hover:border-slate-200'
                  }`}
                  title={JOBS[jobId].name}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border border-slate-100">
                    <JobIll gender={player.gender} race={player.race} />
                  </div>
                  {isSelected && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white z-10">
                      <Check size={10} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
            <Shield size={16} /> アカウント情報
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold ml-1">プレイヤーID</span>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-mono text-slate-800 break-all">
                  {player.id}
                </div>
                <button
                  onClick={handleCopyId}
                  className={`px-3 rounded-lg border transition-all flex items-center justify-center ${
                    copied ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-500'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
            <HardDrive size={16} /> ゲームプレイ設定
          </h3>
          <div className="space-y-4">
            <label className="text-xs text-slate-400 block font-bold ml-1">ゲーム難易度</label>
            <div className="grid grid-cols-1 gap-3">
              {difficultyLevels.map((level) => (
                <button
                  key={level.key}
                  onClick={() => setDifficulty(level.key)}
                  className={`p-4 text-left rounded-xl border-2 transition-all ${
                    difficulty === level.key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold ${difficulty === level.key ? 'text-blue-600' : 'text-slate-700'}`}>
                      {level.label}
                    </span>
                    {difficulty === level.key && <Check size={16} className="text-blue-600" />}
                  </div>
                  <p className={`text-xs leading-relaxed ${difficulty === level.key ? 'text-blue-500/80' : 'text-slate-400'}`}>
                    {level.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full p-4 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
        >
          <LogOut size={18} /> ログアウト
        </button>
      </div>
    </div>
  );
};

export default SettingsView;