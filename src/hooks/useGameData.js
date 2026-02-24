import { useState, useEffect } from 'react';
import { setMonsterData } from '../constants/monsters';

export const useGameData = () => {
  const [uiTextData, setUiTextData] = useState({});
  const [floorWords, setFloorWords] = useState({ EASY: {}, NORMAL: {}, HARD: {} });
  const [charGachaData, setCharGachaData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [openingStory, setOpeningStory] = useState([]); // これを追加

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. UIテキストの読み込み
        const UI_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfEgWNxGwbva_n3iSREx58_lkbt6LqGAHrRJJSSGcoahWRV71wTzXtIDYNFL44RqIVj3ZRiBd3j9bt/pub?gid=1940138879&single=true&output=csv";
        const uiRes = await fetch(`${UI_URL}&cache_bust=${Date.now()}`);
        const uiRows = (await uiRes.text()).split(/\r?\n/).filter(r => r.trim()).slice(1);
        const uiMap = {};
        uiRows.forEach(r => { const [k, j1, j2, e] = r.split(','); uiMap[k] = { JA_KANJI: j1, JA_KANA: j2, EN: e }; });
        setUiTextData(uiMap);

        // 2. フロア別ワードの読み込み
        const WORD_URLS = {
          EASY: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUX7NWJ_6HA9gpX6yc3EGiSCL1GOiMAk6_Mp8gg2JuvuCgodmO4vARpOqx-8v8mXPQ8Zz1hkbgfkP-/pub?output=csv",
          NORMAL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUX7NWJ_6HA9gpX6yc3EGiSCL1GOiMAk6_Mp8gg2JuvuCgodmO4vARpOqx-8v8mXPQ8Zz1hkbgfkP-/pub?output=csv",
          HARD: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUX7NWJ_6HA9gpX6yc3EGiSCL1GOiMAk6_Mp8gg2JuvuCgodmO4vARpOqx-8v8mXPQ8Zz1hkbgfkP-/pub?output=csv"
        };
        const newFloorWords = { EASY: {}, NORMAL: {}, HARD: {} };
        for (const m of ['EASY', 'NORMAL', 'HARD']) {
          const res = await fetch(WORD_URLS[m]);
          const rows = (await res.text()).split(/\r?\n/).filter(r => r.trim()).slice(1);
          rows.forEach(r => {
            const c = r.split(','); if (c.length < 3) return;
            newFloorWords[m][c[0].trim()] = c[1].split('|').map((d, i) => ({ display: d, romaji: (c[2].split('|')[i] || d).toLowerCase().trim() }));
          });
        }
        setFloorWords(newFloorWords);

        // 3. モンスターデータの読み込み (列指定に合わせて修正)
        const MON_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUYOn06FemGZsLKQrl8O-DfBZ8Jf9lOc-Swlhv3BgjIkuPx-dUNyOk2z301fbUgdbJYLQSUprYL8jq/pub?gid=0&single=true&output=csv";
        const monRes = await fetch(`${MON_URL}&cache_bust=${Date.now()}`);
        const monRows = (await monRes.text()).split(/\r?\n/).filter(r => r.trim()).slice(1);
        const monMap = {};
        
        monRows.forEach(r => {
          const c = r.split(','); 
          if (c.length < 9) return; // I列(8)までデータが必要なので最小9列チェック
          
          const key = c[0].trim(); // A列：ID
          monMap[key] = {
            key: key,
            name: c[1].trim(),       // B列：名前
            imageId: c[2].trim(),    // C列：画像ファイル名
            hp: parseInt(c[3]) || 100,      // D列：HP
            atk: parseInt(c[4]) || 10,      // E列：攻撃力
            minFloor: parseInt(c[5]) || 1,  // F列：出現開始階層
            maxFloor: parseInt(c[6]) || 100, // G列：出現終了階層
            displaySize: parseInt(c[7]) || 128, // H列：表示サイズ
            isBossOnly: c[8].trim().toUpperCase() === 'TRUE' // I列：ボス専用フラグ
          };
        });
        setMonsterData(monMap);

        // 4. ガチャデータの読み込み
        const GACHA_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSX390LCOBUeNUoNT470sNNpvpRe3IcN32-Nx3xmp86xcy44YzaDnnBgM4cM2XMUcXLHOLokfAObT3c/pub?gid=2090543331&single=true&output=csv";
        const gachaRows = (await (await fetch(GACHA_URL)).text()).split(/\r?\n/).filter(r => r.trim()).slice(1);
        const gachaData = gachaRows.map(r => {
          const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const cl = (v) => v?.replace(/^"|"$/g, '').trim() || "";
          return { id: cl(c[0]), name: cl(c[1]), race: cl(c[2]), gender: cl(c[3]), job: cl(c[4]), rarity: cl(c[5])||'N', stats: { hp: parseInt(cl(c[6])), str: parseInt(cl(c[7])), vit: parseInt(cl(c[8])), dex: parseInt(cl(c[9])), agi: parseInt(cl(c[10])), luk: parseInt(cl(c[11])) }, chance: parseFloat(cl(c[13])), imageId: cl(c[14]) };
        });
        setCharGachaData(gachaData);
        setDataLoaded(true);
      } catch (e) { console.error("Data load failed", e); }

      // 5. オープニングストーリーの読み込み
        const STORY_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbDXCCUKdMlC10Z9ccG7AyGjps4VOuChiuOBQVTMGzE5B2LGl50UwRXyYpQ7eDH2YvUUWOdYpPYLKV/pub?gid=814494594&single=true&output=csv"; 
        const storyRes = await fetch(`${STORY_URL}&cache_bust=${Date.now()}`);
        const storyRows = (await storyRes.text()).split(/\r?\n/).filter(r => r.trim()).slice(1);
        
        const storyData = storyRows.map(r => {
          const c = r.split(',');
          return {
            id: c[0],
            scene: c[1],
            name: c[2],
            bg: c[3],
            charImg: c[4],
            text: {
              JA_KANJI: c[5],
              JA_HIRA: c[6], // ひらがな列
              EN: c[7]
            },
            uiType: c[8]?.trim() || null // INPUT_NAME, SELECT_JOBなど
          };
        });
        setOpeningStory(storyData);

    };
    fetchData();
  }, []);

return { uiTextData, floorWords, charGachaData, openingStory, dataLoaded }; 
};