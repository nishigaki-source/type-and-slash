import React, { useState } from 'react';

export const StoryModal = ({ data, language, playerName, onNext, onAction }) => {
  const [inputVal, setInputVal] = useState(""); // 入力中の名前管理

  if (!data) return null;

  const renderText = (text) => {
    if (!text) return "";
    const defaultName = language === 'EN' ? 'Adventurer' : 
                       language === 'JA_HIRA' ? 'ぼうけんしゃ' : '冒険者';
    return text.replace(/\${PLAYER_NAME}/g, playerName || defaultName);
  };

  return (
    <div className={`absolute inset-0 z-[100] bg-black flex flex-col items-center justify-end p-6 bg-cover bg-center transition-all duration-1000 ${data.uiType === 'EFFECT_SHAKE' ? 'animate-shake' : ''}`}
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

        {/* --- 名前入力UIの表示 --- */}
        {data.uiType === 'INPUT_NAME' && (
          <div className="mb-6 animate-slide-up">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full bg-slate-800 border-2 border-blue-400 rounded-lg p-4 text-center text-2xl font-bold text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-slate-600"
              placeholder={language === 'EN' ? "Enter your name..." : "なまえを いれてください..."}
              maxLength={10}
              autoFocus
            />
          </div>
        )}

        <div className="w-full flex justify-center">
          {!data.uiType || data.uiType.startsWith('EFFECT') ? (
            <button onClick={onNext} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg animate-pulse">
              NEXT...
            </button>
          ) : (
            <button 
              onClick={() => {
                if (data.uiType === 'INPUT_NAME') {
                  if (inputVal.trim()) onAction(data.uiType, inputVal.trim());
                } else {
                  onAction(data.uiType);
                }
              }}
              className={`px-10 py-4 rounded-xl font-black text-xl shadow-lg transform active:scale-95 transition-all ${
                data.uiType === 'INPUT_NAME' && !inputVal.trim() 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-slate-900'
              }`}
              disabled={data.uiType === 'INPUT_NAME' && !inputVal.trim()}
            >
              {data.uiType === 'INPUT_NAME' ? '決定' : 
               data.uiType === 'SELECT_JOB' ? '職業を選択する' : '進む'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};