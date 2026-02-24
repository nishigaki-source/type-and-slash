import { useState, useEffect } from 'react';
import { setMonsterData } from '../constants/monsters';

export const useGameData = () => {
  const [uiTextData, setUiTextData] = useState({});
  const [floorWords, setFloorWords] = useState({ EASY: {}, NORMAL: {}, HARD: {} });
  const [charGachaData, setCharGachaData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. UIテキストの読み込み
        const UI_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfEgWNxGwbva_n3iSREx58_lkbt6LqGAHrRJJSSGcoahWRV71wTzXtIDYNFL44RqIVj3ZRiBd3j9bt/pub?gid=1940138879&single=true&output=csv";
        const uiRes = await fetch(`${UI_CSV_URL}&cache_bust=${Date.now()}`);
        const uiText = await uiRes.text();
        const uiRows = uiText.split(/\r?\n/).filter(row => row.trim() !== "").slice(1);
        const uiMapping = {};
        uiRows.forEach(row => {
          const [key, kanji, kana, en] = row.split(',');
          uiMapping[key] = { JA_KANJI: kanji, JA_KANA: kana, EN: en };
        });
        setUiTextData(uiMapping);

        // 2. モンスターデータの読み込み
        const MONSTER_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUYOn06FemGZsLKQrl8O-DfBZ8Jf9lOc-Swlhv3BgjIkuPx-dUNyOk2z301fbUgdbJYLQSUprYL8jq/pub?gid=0&single=true&output=csv";
        const monRes = await fetch(`${MONSTER_BASE_URL}&cache_bust=${Date.now()}`);
        const monText = await monRes.text();
        const monRows = monText.split(/\r?\n/).filter(row => row.trim() !== "").slice(1);
        const newMonsterData = {};
        monRows.forEach(row => {
          const cols = row.split(',');
          if (cols.length < 11) return;
          newMonsterData[cols[0].trim()] = {
            name: cols[1].trim(),
            imageId: cols[2].trim(),
            hpMod: parseFloat(cols[3]) || 1.0,
            minFloor: parseInt(cols[4]) || 1,
            maxFloor: parseInt(cols[5]) || 100,
            displaySize: parseInt(cols[6]) || 128,
            isBossOnly: cols[7].trim().toUpperCase() === 'TRUE'
          };
        });
        setMonsterData(newMonsterData);

        // 3. キャラクターガチャデータの読み込み
        const GACHA_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSX390LCOBUeNUoNT470sNNpvpRe3IcN32-Nx3xmp86xcy44YzaDnnBgM4cM2XMUcXLHOLokfAObT3c/pub?gid=2090543331&single=true&output=csv";
        const gachaRes = await fetch(GACHA_URL);
        const gachaText = await gachaRes.text();
        const gachaRows = gachaText.split(/\r?\n/).filter(row => row.trim() !== "").slice(1);
        const loadedGacha = gachaRows.map(row => {
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const clean = (val) => val?.replace(/^"|"$/g, '').trim() || "";
          return {
            id: clean(cols[0]), name: clean(cols[1]), race: clean(cols[2]), gender: clean(cols[3]), job: clean(cols[4]),
            rarity: clean(cols[5]) || 'N',
            stats: { hp: parseInt(clean(cols[6])), str: parseInt(clean(cols[7])), vit: parseInt(clean(cols[8])), dex: parseInt(clean(cols[9])), agi: parseInt(clean(cols[10])), luk: parseInt(clean(cols[11])) },
            chance: parseFloat(clean(cols[13])), imageId: clean(cols[14])
          };
        });
        setCharGachaData(loadedGacha);

        setDataLoaded(true);
      } catch (e) {
        console.error("Data load failed:", e);
      }
    };
    fetchAllData();
  }, []);

  return { uiTextData, floorWords, charGachaData, dataLoaded };
};