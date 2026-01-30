import React, { useState } from 'react';
import { Settings, Copy, Check, Edit2, Save, X, Loader2, Gamepad2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../../lib/firebase';

const SettingsView = ({ player, setPlayer, difficulty, setDifficulty }) => {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(player.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(player.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditing = () => {
    setNewName(player.name);
    setIsEditingName(true);
  };

  const cancelEditing = () => {
    setIsEditingName(false);
    setNewName(player.name);
  };

  const saveName = async () => {
    if (!newName.trim()) {
      alert("名前を入力してください");
      return;
    }
    if (newName.length > 10) {
      alert("名前は10文字以内で入力してください");
      return;
    }
    if (newName === player.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'saveData', 'current');
      await updateDoc(userRef, {
        "player.name": newName
      });
      setPlayer(prev => ({ ...prev, name: newName }));
      setIsEditingName(false);
    } catch (e) {
      console.error("Name update error:", e);
      alert("名前の更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  // 難易度変更ハンドラ (変更時に即保存はせず、GameコンポーネントのuseEffectでまとめて保存される)
  const handleDifficultyChange = (newDiff) => {
    setDifficulty(newDiff);
  };

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in p-6">
      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 border-b pb-4 mb-6">
        <Settings /> 設定・プロフィール
      </h2>

      <div className="space-y-6 overflow-y-auto">
        
        {/* プロフィールカード */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 mb-4">アカウント情報</h3>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">プレイヤー名</div>
              
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 border border-blue-300 rounded px-3 py-2 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    maxLength={10}
                    autoFocus
                  />
                  <button onClick={saveName} disabled={isSaving} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-500 disabled:bg-slate-300 transition-colors">
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  </button>
                  <button onClick={cancelEditing} disabled={isSaving} className="bg-slate-200 text-slate-500 p-2 rounded hover:bg-slate-300 disabled:opacity-50 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <div className="text-lg font-bold text-slate-800">{player.name}</div>
                  <button onClick={startEditing} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors" title="名前を変更">
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">ユーザーID (フレンド検索用)</div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 px-4 py-2 rounded border border-slate-200 font-mono text-slate-600 flex-1 break-all">
                  {player.id}
                </div>
                <button onClick={handleCopyId} className={`p-2 rounded border transition-colors ${copied ? 'bg-green-100 text-green-600 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`} title="IDをコピー">
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ゲーム設定 (難易度) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
            <Gamepad2 size={16} /> ゲーム設定
          </h3>
          
          <div>
            <div className="text-xs text-slate-400 mb-2">難易度 (出題モード)</div>
            <div className="flex gap-2">
              {[
                { key: 'EASY', label: 'かんたん', desc: 'ひらがな中心' },
                { key: 'NORMAL', label: 'ふつう', desc: '漢字・一般' },
                { key: 'HARD', label: 'むずかしい', desc: '英語・記号' }
              ].map(mode => (
                <button
                  key={mode.key}
                  onClick={() => handleDifficultyChange(mode.key)}
                  className={`flex-1 py-3 px-2 rounded-lg border transition-all ${
                    difficulty === mode.key 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-sm">{mode.label}</div>
                  <div className={`text-[10px] ${difficulty === mode.key ? 'text-blue-200' : 'text-slate-400'}`}>{mode.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              ※難易度を変更すると、出現する敵の強さや出題ワードの傾向が変化します。
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
          <p>その他の設定項目は現在開発中です</p>
          <p>Sound: ON / OFF</p>
          <p>Notifications: ON / OFF</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;