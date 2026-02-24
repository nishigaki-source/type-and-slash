// src/components/ui/StoryModal.jsx
export const StoryModal = ({ data, language, onNext }) => {
  if (!data) return null;
  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-end p-10 bg-cover bg-center"
         style={{ backgroundImage: `url('/backgrounds/${data.bg}')` }}>
      <div className="bg-slate-900/90 w-full max-w-3xl p-6 border-4 border-blue-500 rounded-xl text-white">
        <div className="text-yellow-400 font-bold mb-2">{data.name}</div>
        <div className="text-xl leading-relaxed mb-6">{data.text[language]}</div>
        <button onClick={onNext} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold">
          次へ (Next)
        </button>
      </div>
    </div>
  );
};