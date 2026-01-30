import React, { useState } from 'react';
import { Package, HelpCircle } from 'lucide-react';

const TreasureSelectionModal = ({ chests, onSelect }) => {
  const [selectedChest, setSelectedChest] = useState(null);

  const handleConfirm = () => {
    if (selectedChest) {
      onSelect(selectedChest);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-center border-4 border-yellow-500">
        <h2 className="text-3xl font-black text-slate-800 mb-2">TREASURE CHANCE!</h2>
        <p className="text-slate-500 mb-8 font-bold">宝箱を1つ選んでください</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {chests.map((chest) => {
            const isSelected = selectedChest && selectedChest.uniqueId === chest.uniqueId;
            return (
              <div 
                key={chest.uniqueId}
                onClick={() => setSelectedChest(chest)}
                className={`
                  relative cursor-pointer transition-all duration-300 transform rounded-xl p-6 border-4 flex flex-col items-center gap-4 bg-white
                  ${isSelected ? 'scale-105 shadow-xl border-blue-500 ring-4 ring-blue-200' : 'hover:scale-105 border-slate-200 hover:border-yellow-400'}
                `}
              >
                {/* 宝箱アイコン (CSSで色分け) */}
                <div className={`w-24 h-24 rounded-lg shadow-inner flex items-center justify-center ${chest.color} ${chest.ringColor ? `ring-4 ${chest.ringColor}` : ''} transition-colors`}>
                   <Package size={48} className="text-white drop-shadow-md" />
                </div>
                
                <div>
                  <div className="font-bold text-lg text-slate-700">{chest.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    RANK: {chest.ranks.join('~')}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-1 shadow-lg animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button 
          onClick={handleConfirm}
          disabled={!selectedChest}
          className={`
            w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all
            ${selectedChest 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02]' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          {selectedChest ? '決定して開ける' : '宝箱を選択してください'}
        </button>
      </div>
    </div>
  );
};

export default TreasureSelectionModal;