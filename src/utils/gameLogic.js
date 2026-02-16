import { CONSUMABLES, ITEM_TYPES, RARITY, JOBS, RACES, PERSONALITIES, GROWTH, ARENA_RANKS, RACE_ADVANTAGES, JOB_ADVANTAGES, TREASURE_CHESTS } from '../constants/data';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getRarity = () => {
  const rand = Math.random();
  if (rand > 1 - RARITY.LR.chance) return RARITY.LR;
  if (rand > 1 - RARITY.LR.chance - RARITY.UR.chance) return RARITY.UR;
  if (rand > 1 - RARITY.LR.chance - RARITY.UR.chance - RARITY.SR.chance) return RARITY.SR;
  if (rand > 1 - RARITY.LR.chance - RARITY.UR.chance - RARITY.SR.chance - RARITY.R.chance) return RARITY.R;
  return RARITY.N;
};

export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 名前ランダム生成
export const generateRandomName = () => {
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンー';
  let name = "";
  const len = Math.floor(Math.random() * 4) + 2; // 2~5文字
  for(let i=0; i<len; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return name;
};

// 道具の生成ヘルパー
export const generateConsumable = () => {
    const consumableKeys = Object.keys(CONSUMABLES);
    const key = consumableKeys[Math.floor(Math.random() * consumableKeys.length)];
    const data = CONSUMABLES[key];
    return {
      id: generateId(),
      name: data.name,
      type: 'CONSUMABLE',
      consumableId: key,
      rarity: 'n',
      stats: { wt: 0 },
      value: data.price,
      jobReq: null,
      imageId: null // 消耗品画像を追加する場合はここを設定
    };
};

/**
 * アイテム生成メインロジック
 * 既存のステータス計算などは維持し、imageId の割り当て処理を追加
 */
export const generateItem = (playerLevel, jobType = null, forceRarityKey = null, forceEquipment = false) => {
  // 30%の確率で消耗品を生成 (強制装備生成モードでない場合)
  if (!forceEquipment && !forceRarityKey && Math.random() < 0.3) {
    return generateConsumable();
  }

  // レアリティの決定
  let rarity;
  if (forceRarityKey) {
    rarity = RARITY[forceRarityKey]; 
  } else {
    rarity = getRarity();
  }

  const types = Object.keys(ITEM_TYPES).filter(t => t !== 'CONSUMABLE');
  const typeKey = types[Math.floor(Math.random() * types.length)];
  const typeName = ITEM_TYPES[typeKey];
  
  let multiplier = 1;
  if (rarity.id === 'r') multiplier = 1.3;
  if (rarity.id === 'sr') multiplier = 1.7;
  if (rarity.id === 'ur') multiplier = 2.5;
  if (rarity.id === 'lr') multiplier = 4.0;

  const baseVal = Math.floor((playerLevel * 2 + 3) * multiplier);
  
  const adjectives = ['古びた', '普通の', '上質な', '重厚な', '軽量な', '伝説の', '神々の'];
  const adjIndex = Math.min(Math.floor(Math.random() * adjectives.length), rarity.id === 'lr' ? 6 : 4);
  const adj = adjectives[adjIndex];
  
  let name = `${adj}${typeName}`;
  let stats = { atk: 0, def: 0, wt: 0 };
  let jobReq = null;

  let baseWt = getRandomInt(1, 4) + Math.floor(playerLevel / 10);
  if (adj === '重厚な') baseWt += 4;
  if (adj === '軽量な') baseWt = Math.max(1, baseWt - 2);

  // 武器・防具の個別ステータス設定
  if (typeKey === 'WEAPON') {
     let targetJob = jobType;
     if (!targetJob) {
        const jobKeys = Object.keys(JOBS);
        targetJob = JOBS[jobKeys[Math.floor(Math.random() * jobKeys.length)]].id;
     }
     jobReq = [targetJob]; 

     if (targetJob === 'fighter') {
       if (Math.random() < 0.7) {
         name = `${adj}剣`;
         stats.atk = baseVal;
         stats.wt = baseWt + 2;
       } else {
         name = `${adj}盾`;
         stats.def = Math.floor(baseVal * 0.8);
         stats.atk = Math.floor(baseVal * 0.2);
         stats.wt = baseWt + 3;
       }
     } else if (targetJob === 'mage') {
       name = `${adj}杖`;
       stats.atk = baseVal;
       stats.wt = baseWt + 1;
     } else if (targetJob === 'monk') {
       name = `${adj}ナックル`;
       stats.atk = Math.floor(baseVal * 0.9);
       stats.wt = baseWt;
     } else if (targetJob === 'archer') {
       name = `${adj}弓`;
       stats.atk = Math.floor(baseVal * 0.9);
       stats.wt = baseWt + 1;
     }
  } 
  else if (typeKey === 'HEAD') {
    const jobKeys = Object.keys(JOBS);
    const targetJob = JOBS[jobKeys[Math.floor(Math.random() * jobKeys.length)]].id;
    jobReq = [targetJob];
    if (targetJob === 'fighter') name = `${adj}兜`;
    else if (targetJob === 'mage') name = `${adj}ハット`;
    else if (targetJob === 'monk') name = `${adj}バンダナ`;
    else if (targetJob === 'archer') name = `${adj}フード`;
    stats.def = Math.floor(baseVal * 0.5);
    stats.wt = baseWt;
  } 
  else if (typeKey === 'BODY') {
    name = `${adj}鎧`;
    stats.def = baseVal;
    stats.wt = baseWt + 4;
  } 
  else if (typeKey === 'FEET') {
    name = `${adj}靴`;
    stats.def = Math.floor(baseVal * 0.3);
    stats.wt = Math.max(0, baseWt - 2);
  } 
  else {
    name = `${adj}指輪`;
    stats.atk = Math.floor(baseVal * 0.2);
    stats.def = Math.floor(baseVal * 0.2);
    stats.wt = 0;
  }

  let uniqueCode = null;
  if (rarity.id === 'lr') {
    stats.wt = Math.max(0, stats.wt - 5);
    uniqueCode = `#${Math.floor(Math.random() * 900000) + 100000}`;
    name = `${name} ${uniqueCode}`;
  }

  // --- 画像割り当てロジック (ここに追加) ---
  let imageId = null;
  if (typeKey === 'WEAPON' && name.includes('剣')) {
    imageId = 'beginner_sword.png'; // 剣には作成済みの画像を割り当て
  }
  // 今後画像が増えたら以下のように追加可能
  // else if (typeKey === 'BODY') { imageId = 'armor.png'; }
  // ---------------------------------------

  return {
    id: generateId(),
    name,
    type: typeKey,
    rarity: rarity.id,
    stats,
    value: baseVal * 10 * RARITY[rarity.id.toUpperCase()].priceMod,
    jobReq,
    uniqueCode,
    locked: false,
    imageId: imageId // 追加した imageId を含める
  };
};

// 宝箱リストを生成する関数
export const getTreasureChests = () => {
  const chests = [];
  for(let i=0; i<3; i++) {
    const r = Math.random();
    let type = TREASURE_CHESTS.NORMAL;
    if (r > 1 - TREASURE_CHESTS.RAINBOW.chance) type = TREASURE_CHESTS.RAINBOW;
    else if (r > 1 - TREASURE_CHESTS.RAINBOW.chance - TREASURE_CHESTS.GOLD.chance) type = TREASURE_CHESTS.GOLD;
    else if (r > 1 - TREASURE_CHESTS.RAINBOW.chance - TREASURE_CHESTS.GOLD.chance - TREASURE_CHESTS.SILVER.chance) type = TREASURE_CHESTS.SILVER;
    
    chests.push({ ...type, uniqueId: generateId() });
  }
  return chests;
};

// 宝箱を開けてアイテムを生成する関数
export const openTreasureChest = (chestType, playerLevel, jobType) => {
  const ranks = chestType.ranks;
  const rankKey = ranks[Math.floor(Math.random() * ranks.length)];
  return generateItem(playerLevel, jobType, rankKey, true);
};

export const calcInitialStats = (jobId, raceId, persId) => {
  const job = JOBS[jobId];
  const race = RACES[raceId];
  const pers = PERSONALITIES[persId];

  const calcStat = (statName) => {
    let val = getRandomInt(5, 10);
    val += (job.initMod[statName] || 0);
    val += (race.mod[statName] || 0);
    if (pers.bonusStat === statName) val += 1;
    return Math.max(5, Math.min(10, val));
  };

  return {
    hp: calcStat('hp'), str: calcStat('str'), vit: calcStat('vit'),
    dex: calcStat('dex'), agi: calcStat('agi'), luk: calcStat('luk'),
  };
};

export const growStats = (currentStats, jobId, levelsToGrow = 1) => {
  const job = JOBS[jobId];
  const newStats = { ...currentStats };
  const gains = { hp: 0, str: 0, vit: 0, dex: 0, agi: 0, luk: 0 };

  for (let i = 0; i < levelsToGrow; i++) {
    Object.keys(gains).forEach(stat => {
      const rate = job.growth[stat];
      const range = GROWTH[rate];
      const val = getRandomInt(range.min, range.max);
      gains[stat] += val;
      newStats[stat] = Math.min(999, newStats[stat] + val);
    });
  }
  return { newStats, gains };
};

export const calculateEffectiveStats = (player, equipped, buffs = {}) => {
  if (!player) return null;

  let s = { ...player.stats };
  
  if (buffs) {
    s.str += (buffs.str || 0);
    s.vit += (buffs.vit || 0);
    s.agi += (buffs.agi || 0);
    s.dex += (buffs.dex || 0);
  }
  
  let equipStats = { atk: 0, def: 0, wt: 0 };
  Object.values(equipped).forEach(item => {
    if (item) {
      equipStats.atk += (item.stats?.atk || 0);
      equipStats.def += (item.stats?.def || 0);
      equipStats.wt += (item.stats?.wt || 0);
    }
  });

  const maxHp = s.hp + (s.vit * 2);
  const totalAtk = s.str + equipStats.atk;
  const totalDef = s.vit + equipStats.def;
  
  const effectiveDex = Math.max(1, Math.floor(s.dex - (equipStats.wt * 0.5)));
  const effectiveAgi = Math.max(1, Math.floor(s.agi - (equipStats.wt * 0.5)));

  const hitRate = Math.min(100, Math.max(50, 90 + (effectiveDex - 5) * 2));
  const evasionRate = Math.min(50, Math.max(0, (effectiveAgi * 0.5)));
  const critRate = Math.min(50, Math.max(1, s.luk * 0.5));

  return {
    base: s,
    equip: equipStats,
    battle: {
      maxHp,
      atk: totalAtk,
      def: totalDef,
      dex: effectiveDex,
      agi: effectiveAgi,
      hitRate,
      evasionRate,
      critRate
    }
  };
};

export const calculateScore = (stage, clearTimeMs, missCount) => {
  const baseScore = stage * 1000;
  const standardTimeMs = 50000 + (stage * 5000); 
  const timeBonus = Math.max(0, Math.floor((standardTimeMs - clearTimeMs) / 100));
  const missPenalty = missCount * 50;
  return Math.max(0, baseScore + timeBonus - missPenalty);
};

export const calculateCPM = (charCount, timeMs) => {
  if (timeMs <= 0) return 0;
  const minutes = timeMs / 60000;
  return parseFloat((charCount / minutes).toFixed(1));
};

export const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getArenaRank = (points) => {
  const pt = points || 0;
  for (let i = ARENA_RANKS.length - 1; i >= 0; i--) {
    if (pt >= ARENA_RANKS[i].min) {
      return ARENA_RANKS[i];
    }
  }
  return ARENA_RANKS[0];
};

export const calculateDamageMultiplier = (attacker, defender) => {
  let multiplier = 1.0;
  let reasons = []; 

  if (!attacker || !defender) return { multiplier, reasons };

  const atkRace = attacker.race ? attacker.race.toUpperCase() : '';
  const defRace = defender.race ? defender.race.toUpperCase() : '';
  const atkJob = attacker.job ? attacker.job.toUpperCase() : '';
  const defJob = defender.job ? defender.job.toUpperCase() : '';

  if (atkRace && defRace && RACE_ADVANTAGES[atkRace]) {
    if (RACE_ADVANTAGES[atkRace].includes(defRace)) {
      multiplier *= 1.2;
      reasons.push('種族有利');
    }
  }

  if (atkJob && defJob && JOB_ADVANTAGES[atkJob]) {
    if (JOB_ADVANTAGES[atkJob].includes(defJob)) {
      multiplier *= 1.2;
      reasons.push('職業有利');
    }
  }

  multiplier = Math.round(multiplier * 100) / 100;
  return { multiplier, reasons };
};