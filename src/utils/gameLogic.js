// src/utils/gameLogic.js
import { CONSUMABLES, ITEM_TYPES, RARITY, JOBS, RACES, PERSONALITIES, GROWTH } from '../constants/data';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getRarity = () => {
  const rand = Math.random();
  if (rand > 1 - RARITY.LEGENDARY.chance) return RARITY.LEGENDARY;
  if (rand > 1 - RARITY.LEGENDARY.chance - RARITY.EPIC.chance) return RARITY.EPIC;
  if (rand > 1 - RARITY.LEGENDARY.chance - RARITY.EPIC.chance - RARITY.RARE.chance) return RARITY.RARE;
  return RARITY.COMMON;
};

export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

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
      rarity: 'common',
      stats: { wt: 0 },
      value: data.price
    };
};

export const generateItem = (playerLevel, jobType = null) => {
  // 30%の確率で消耗品を生成
  if (Math.random() < 0.3) {
    return generateConsumable();
  }

  const rarity = getRarity();
  const types = Object.keys(ITEM_TYPES).filter(t => t !== 'CONSUMABLE');
  const typeKey = types[Math.floor(Math.random() * types.length)];
  const typeName = ITEM_TYPES[typeKey];
  
  let multiplier = 1;
  if (rarity.id === 'rare') multiplier = 1.3;
  if (rarity.id === 'epic') multiplier = 1.8;
  if (rarity.id === 'legendary') multiplier = 3.0;

  const baseVal = Math.floor((playerLevel * 2 + 3) * multiplier);
  
  const adjectives = ['古びた', '普通の', '上質な', '重厚な', '軽量な', '伝説の', '神々の'];
  const adjIndex = Math.min(Math.floor(Math.random() * adjectives.length), rarity.id === 'legendary' ? 6 : 4);
  const adj = adjectives[adjIndex];
  
  let name = `${adj}${typeName}`;
  let stats = { atk: 0, def: 0, wt: 0 };

  let baseWt = getRandomInt(1, 4) + Math.floor(playerLevel / 10);
  if (adj === '重厚な') baseWt += 4;
  if (adj === '軽量な') baseWt = Math.max(1, baseWt - 2);

  let targetJob = jobType;
  if (!targetJob && typeKey === 'WEAPON') {
     const jobKeys = Object.keys(JOBS);
     targetJob = JOBS[jobKeys[Math.floor(Math.random() * jobKeys.length)]].id;
  }

  if (typeKey === 'WEAPON') {
    if (targetJob === 'fighter') name = `${adj}剣`;
    else if (targetJob === 'mage') name = `${adj}杖`;
    else if (targetJob === 'monk') name = `${adj}爪`;
    else if (targetJob === 'archer') name = `${adj}弓`;
    else name = `${adj}武器`;
    
    stats.atk = baseVal;
    stats.wt = baseWt + 2;
  } else if (typeKey === 'HEAD') {
    name = `${adj}兜`;
    stats.def = Math.floor(baseVal * 0.5);
    stats.wt = baseWt;
  } else if (typeKey === 'BODY') {
    name = `${adj}鎧`;
    stats.def = baseVal;
    stats.wt = baseWt + 4;
  } else if (typeKey === 'FEET') {
    name = `${adj}靴`;
    stats.def = Math.floor(baseVal * 0.3);
    stats.wt = Math.max(0, baseWt - 2);
  } else {
    name = `${adj}指輪`;
    stats.atk = Math.floor(baseVal * 0.2);
    stats.def = Math.floor(baseVal * 0.2);
    stats.wt = 0;
  }

  if (rarity.id === 'legendary') stats.wt = Math.max(0, stats.wt - 5);

  return {
    id: generateId(),
    name,
    type: typeKey,
    rarity: rarity.id,
    stats,
    value: baseVal * 10 * RARITY[rarity.id.toUpperCase()].priceMod
  };
};

// ステータス計算 (初期値)
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

// ステータス成長
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