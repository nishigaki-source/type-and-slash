import React, { useState } from 'react';

export const StoryModal = ({ data, language, playerName, onNext, onAction }) => {
  const [inputVal, setInputVal] = useState("");

  if (!data) return null;

  // 1. スプレッドシートから読み込んだuiTypeの空白・改行を完全に除去し、大文字に統一
  // これにより INPUT_NAME、SELECT_ORIGIN、EFFECT_SHAKE 等が正確に判定されます
  const safeUiType = data.uiType ? data.uiType.replace(/\s+/g, "").toUpperCase() : "";

  const renderText = (text) => {
    if (!text) return "";
    // playerNameが空（入力中または未入力）なら「……」を表示。勝手に「冒険者」を入れない
    if (!playerName) {
      return text.replace(/\${PLAYER_NAME}/g, "……"); 
    }
    return text.replace(/\${PLAYER_NAME}/g, playerName);
  };

  return (
    <div className={`absolute inset-0 z-[100] bg-black flex flex-col items-center justify-end p-6 bg-cover bg-center transition-all duration-1000 ${safeUiType === 'EFFECT_SHAKE' ? 'animate-shake' : ''}`}
         style={{ backgroundImage: `url('/backgrounds/${data.bg}')` }}>
      
      <div className="absolute inset-0 bg-black/40 z-0" />

      {data.charImg && (
        <div className="absolute bottom-40 z-10 animate-fade-in max-w-[80%] h-3/5">
          <img src={`/character/${data.charImg}`} alt="" className="h-full object-contain image-pixelated" />
        </div>
      )}

      <div className="relative z-20 bg-slate-900/95 w-full max-w-4xl p-6 border-4 border-blue-500 rounded-2xl text-white shadow-2xl">
        {data.name && (
          <div className="absolute -top-6 left-6 bg-blue-600 px-4 py-1 rounded-full font-bold text-sm">
            {data.name}
          </div>
        )}
        
        <div className="text-lg sm:text-2xl leading-relaxed mb-6 min-h-[5rem]">
          {renderText(data.text[language] || data.text['JA_KANJI'])}
        </div>

        {/* --- 2. 名前入力UIの表示判定 --- */}
        {safeUiType === 'INPUT_NAME' && (
          <div className="mb-6 animate-slide-up">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full bg-slate-800 border-2 border-blue-400 rounded-lg p-4 text-center text-2xl font-bold text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-slate-600"
              placeholder={language === 'EN' ? "Enter your name..." : "なまえを いれてください..."}
              maxLength={10}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputVal.trim()) {
                  onAction('INPUT_NAME', inputVal.trim());
                }
              }}
            />
          </div>
        )}

        <div className="w-full flex justify-center">
          {/* --- 3. ボタンの厳格な出し分けロジック --- */}
          {safeUiType === 'INPUT_NAME' ? (
            /* 名前入力時は「決定」ボタンのみ。空入力での進行を物理的に遮断 */
            <button 
              onClick={() => {
                if (inputVal.trim()) {
                  onAction('INPUT_NAME', inputVal.trim());
                }
              }}
              className={`px-10 py-4 rounded-xl font-black text-xl shadow-lg transform active:scale-95 transition-all ${
                !inputVal.trim() 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-slate-900'
              }`}
              disabled={!inputVal.trim()}
            >
              決定
            </button>
          ) : (safeUiType === 'SELECT_JOB' || safeUiType === 'START_GAME' || safeUiType === 'SELECT_ORIGIN') ? (
            /* アクション（画面遷移や選択）が必要な場合 */
            <button 
              onClick={() => onAction(data.uiType)}
              className="px-10 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black text-xl shadow-lg transform active:scale-95 transition-all"
            >
              {safeUiType === 'SELECT_JOB' ? '職業を選択する' : '進む'}
            </button>
          ) : (
            /* uiTypeが空、または EFFECT_... 等の演出シーンでは通常の NEXT ボタンを表示 */
            <button 
              onClick={onNext} 
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg animate-pulse"
            >
              NEXT...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};