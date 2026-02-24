import { useRef, useEffect } from 'react';

export const useAudio = (gameState, showAuth, isMuted, battleState) => {
  const bgmRef = useRef(null);
  const townBgmRef = useRef(null);
  const battleBgmRef = useRef(null);

  useEffect(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio('/sounds/title_bgm.mp3');
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.5;
    }
    if (!townBgmRef.current) {
      townBgmRef.current = new Audio('/sounds/town_bgm.mp3');
      townBgmRef.current.loop = true;
      townBgmRef.current.volume = 0.4;
    }
    if (!battleBgmRef.current) {
      battleBgmRef.current = new Audio();
      battleBgmRef.current.loop = true;
      battleBgmRef.current.volume = 0.5;
    }

    bgmRef.current.muted = isMuted;
    townBgmRef.current.muted = isMuted;
    battleBgmRef.current.muted = isMuted;

    const isMainTitleActive = gameState === 'TITLE' || gameState === 'CHAR_CREATE' || showAuth;
    const isTownActive = gameState === 'TOWN';
    const isBattleActive = gameState === 'BATTLE';

    if (isMainTitleActive) {
      townBgmRef.current.pause();
      battleBgmRef.current.pause();
      bgmRef.current.play().catch(() => {});
    } else if (isTownActive) {
      bgmRef.current.pause();
      battleBgmRef.current.pause();
      townBgmRef.current.play().catch(() => {});
    } else if (isBattleActive && battleState) {
      bgmRef.current.pause();
      townBgmRef.current.pause();
      let bgmPath = battleState.zoneName === "はじまりの草原" ? '/sounds/grassland_battle.mp3' : '/sounds/battle_normal.mp3';
      if (battleBgmRef.current.src !== window.location.origin + bgmPath) battleBgmRef.current.src = bgmPath;
      battleBgmRef.current.play().catch(() => {});
    } else {
      [bgmRef, townBgmRef, battleBgmRef].forEach(ref => ref.current.pause());
    }
  }, [gameState, showAuth, isMuted, battleState]);
};