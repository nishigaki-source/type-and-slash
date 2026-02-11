import React from 'react';
import { Shield, FlaskConical, Clover, Pill, Flame, Wind } from 'lucide-react';
import { SVGs } from '../components/GameSvgs';

export const GROWTH = {
  S: { min: 4, max: 6 },
  A: { min: 3, max: 5 },
  B: { min: 2, max: 4 },
  C: { min: 1, max: 3 },
  D: { min: 0, max: 2 },
};

// アリーナランク定義
export const ARENA_RANKS = [
  { id: 'BRONZE', name: 'ブロンズ', min: 0, max: 999, color: 'text-orange-700', icon: 'Dg' },
  { id: 'SILVER', name: 'シルバー', min: 1000, max: 2999, color: 'text-slate-400', icon: 'Ag' },
  { id: 'GOLD', name: 'ゴールド', min: 3000, max: 4999, color: 'text-yellow-500', icon: 'Au' },
  { id: 'PLATINUM', name: 'プラチナ', min: 5000, max: 6999, color: 'text-cyan-400', icon: 'Pt' },
  { id: 'DIAMOND', name: 'ダイヤモンド', min: 7000, max: 8499, color: 'text-blue-300', icon: 'dm' },
  { id: 'MASTER', name: 'マスター', min: 8500, max: 9499, color: 'text-purple-500', icon: 'Ms' },
  { id: 'CHAMPION', name: 'チャンピオン', min: 9500, max: 9999999, color: 'text-red-500', icon: 'Kg' },
];

// 種族の相性定義 (4すくみ)
export const RACE_ADVANTAGES = {
  HUMAN: ['ELF'],    // 人間 -> エルフ
  ELF: ['DEMON'],    // エルフ -> 魔族
  DEMON: ['DWARF'],  // 魔族 -> ドワーフ
  DWARF: ['HUMAN'],  // ドワーフ -> 人間
};

// 職業の相性定義 (4すくみ)
export const JOB_ADVANTAGES = {
  FIGHTER: ['ARCHER'], // ファイター -> アーチャー
  ARCHER: ['MONK'],    // アーチャー -> モンク
  MONK: ['MAGE'],      // モンク -> メイジ
  MAGE: ['FIGHTER'],   // メイジ -> ファイター
};

export const JOBS = {
  FIGHTER: { 
    id: 'fighter', name: 'ファイター', weapon: '剣', 
    Illustration: SVGs.Fighter,
    growth: { hp: 'B', str: 'S', vit: 'A', dex: 'C', agi: 'C', luk: 'C' },
    initMod: { str: 2, vit: 1, dex: -1, agi: -1, luk: 0 }
  },
  MAGE: { 
    id: 'mage', name: 'メイジ', weapon: '杖', 
    Illustration: SVGs.Mage,
    growth: { hp: 'C', str: 'D', vit: 'C', dex: 'S', agi: 'B', luk: 'A' },
    initMod: { str: -2, vit: -1, dex: 2, agi: 0, luk: 1 }
  },
  MONK: { 
    id: 'monk', name: 'モンク', weapon: 'ナックル', 
    Illustration: SVGs.Monk,
    growth: { hp: 'S', str: 'B', vit: 'B', dex: 'B', agi: 'A', luk: 'C' },
    initMod: { hp: 2, str: 0, vit: 0, dex: 0, agi: 1, luk: -1 }
  },
  ARCHER: { 
    id: 'archer', name: 'アーチャー', weapon: '弓', 
    Illustration: SVGs.Archer,
    growth: { hp: 'B', str: 'C', vit: 'C', dex: 'A', agi: 'S', luk: 'B' },
    initMod: { str: 0, vit: -1, dex: 1, agi: 2, luk: 0 }
  },
};

export const CONSUMABLES = {
  POTION_S: { id: 'potion_s', name: 'ポーション', effect: { type: 'HEAL', value: 50 }, icon: <FlaskConical className="text-red-500" />, desc: 'HPを50回復', price: 50 },
  POTION_M: { id: 'potion_m', name: 'ハイポーション', effect: { type: 'HEAL', value: 150 }, icon: <FlaskConical className="text-red-600" />, desc: 'HPを150回復', price: 150 },
  ANTIDOTE: { id: 'antidote', name: '毒消し草', effect: { type: 'CURE', ailment: 'POISON' }, icon: <Clover className="text-green-500" />, desc: '毒を回復', price: 30 },
  POWER_DRUG: { id: 'power_drug', name: '鬼人薬', effect: { type: 'BUFF', stat: 'str', value: 10, duration: 15000 }, icon: <Flame className="text-orange-500" />, desc: '15秒間、力+10', price: 200 },
  HARD_SHELL: { id: 'hard_shell', name: '硬化薬', effect: { type: 'BUFF', stat: 'vit', value: 10, duration: 15000 }, icon: <Shield className="text-blue-500" />, desc: '15秒間、耐久+10', price: 200 },
  SPEED_POT: { id: 'speed_pot', name: '疾風の薬', effect: { type: 'BUFF', stat: 'agi', value: 10, duration: 15000 }, icon: <Wind className="text-cyan-500" />, desc: '15秒間、素早さ+10', price: 200 },
};

export const MONSTER_TYPES = {
  SLIME: { name: 'スライム', illustration: SVGs.Slime, hpMod: 0.8 },
  BAT: { name: 'こうもり', illustration: SVGs.Bat, hpMod: 0.6 },
  GOBLIN: { name: 'ゴブリン', illustration: SVGs.Goblin, hpMod: 1.0, actions: ['POISON'] },
  WOLF: { name: 'オオカミ', illustration: SVGs.Wolf, hpMod: 1.2 },
  SKELETON: { name: 'ガイコツ', illustration: SVGs.Skeleton, hpMod: 1.1 },
  DRAGON: { name: 'ドラゴン', illustration: SVGs.Dragon, hpMod: 3.0, actions: ['POISON'] },
  DEMON: { name: 'デーモン', illustration: SVGs.Demon, hpMod: 3.5 },
};

export const RACES = {
  HUMAN: { id: 'human', name: '人間', mod: { str: 0, vit: 0, dex: 0, agi: 0, luk: 0 } },
  ELF: { id: 'elf', name: 'エルフ', mod: { str: -1, vit: -1, dex: 1, agi: 1, luk: 0 } },
  DEMON: { id: 'demon', name: '魔族', mod: { str: 2, vit: 0, dex: -1, agi: -1, luk: -1 } },
  DWARF: { id: 'dwarf', name: 'ドワーフ', mod: { str: 1, vit: 2, dex: -1, agi: -2, luk: 0 } },
};

export const PERSONALITIES = {
  BRAVE: { id: 'brave', name: '勇敢', bonusStat: 'str' },
  GREEDY: { id: 'greedy', name: '強欲', bonusStat: 'luk' },
  PHILANTHROPIC: { id: 'philanthropic', name: '博愛', bonusStat: 'vit' },
  FLEXIBLE: { id: 'flexible', name: '柔軟', bonusStat: 'dex' },
};

export const DIFFICULTY_SETTINGS = {
  EASY: {
    target: "初心者・低学年",
    zones: [
      {
        id: 1, name: "はじまりの草原", range: [1, 5], bossType: 'SLIME',
        features: "基礎・指慣らし",
        boss: ["巨大スライム", "キングスライム"], 
        // zakoなどの設定は維持
      },
      {
        id: 2, name: "静かなる森", range: [6, 10], bossType: 'GOBLIN',
        features: "濁音の練習",
        boss: ["ゴブリンリーダー", "森の番人"],
      },
      {
        id: 3, name: "古の遺跡", range: [11, 15], bossType: 'SKELETON',
        features: "拗音の練習",
        boss: ["スケルトンナイト", "遺跡の守護者"],
      },
      // ... 100Fまで5F刻みで定義
    ]
  },
  NORMAL: {
    target: "初心者・低学年",
    zones: [
      {
        id: 1, name: "はじまりの草原", range: [1, 5], bossType: 'SLIME',
        features: "基礎・指慣らし",
        boss: ["巨大スライム", "キングスライム"], 
        // zakoなどの設定は維持
      },
      {
        id: 2, name: "静かなる森", range: [6, 10], bossType: 'GOBLIN',
        features: "濁音の練習",
        boss: ["ゴブリンリーダー", "森の番人"],
      },
      {
        id: 3, name: "古の遺跡", range: [11, 15], bossType: 'SKELETON',
        features: "拗音の練習",
        boss: ["スケルトンナイト", "遺跡の守護者"],
      },
      // ... 100Fまで5F刻みで定義
    ]
  },
  HARD: {
    target: "初心者・低学年",
    zones: [
      {
        id: 1, name: "はじまりの草原", range: [1, 5], bossType: 'SLIME',
        features: "基礎・指慣らし",
        boss: ["巨大スライム", "キングスライム"], 
        // zakoなどの設定は維持
      },
      {
        id: 2, name: "静かなる森", range: [6, 10], bossType: 'GOBLIN',
        features: "濁音の練習",
        boss: ["ゴブリンリーダー", "森の番人"],
      },
      {
        id: 3, name: "古の遺跡", range: [11, 15], bossType: 'SKELETON',
        features: "拗音の練習",
        boss: ["スケルトンナイト", "遺跡の守護者"],
      },
      // ... 100Fまで5F刻みで定義
    ]
  },
  // NORMAL, HARDも同様に設定
};

// 互換性のためにフラットなリストも残す
export const WORD_LISTS = {
  EASY: DIFFICULTY_SETTINGS.EASY.zones[0].zako,
  NORMAL: DIFFICULTY_SETTINGS.NORMAL.zones[0].zako,
  HARD: DIFFICULTY_SETTINGS.HARD.zones[0].zako
};

// 宝箱の定義を追加
export const TREASURE_CHESTS = {
  NORMAL: { id: 'NORMAL', name: '普通の宝箱', color: 'bg-stone-500', ringColor: 'ring-stone-700', ranks: ['N', 'R'], chance: 0.7 },
  SILVER: { id: 'SILVER', name: '銀色の宝箱', color: 'bg-slate-300', ringColor: 'ring-slate-400', ranks: ['R', 'SR'], chance: 0.2 },
  GOLD: { id: 'GOLD', name: '金色の宝箱', color: 'bg-yellow-400', ringColor: 'ring-yellow-600', ranks: ['SR', 'UR'], chance: 0.07 },
  RAINBOW: { id: 'RAINBOW', name: '虹色の宝箱', color: 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-red-500 via-yellow-500 to-blue-500', ringColor: 'ring-white', ranks: ['UR', 'LR'], chance: 0.03 },
};

export const RARITY = {
  N: { id: 'n', name: 'ノーマル', color: 'text-slate-600', chance: 0.7, priceMod: 1 },
  R: { id: 'r', name: 'レア', color: 'text-blue-600', chance: 0.2, priceMod: 2 },
  SR: { id: 'sr', name: 'スーパーレア', color: 'text-green-600', chance: 0.09, priceMod: 5 },
  UR: { id: 'ur', name: 'ウルトラレア', color: 'text-orange-500', chance: 0.009, priceMod: 10 },
  LR: { id: 'lr', name: 'レジェンド', color: 'text-yellow-500', chance: 0.001, priceMod: 20 },
};

export const ITEM_TYPES = {
  HEAD: '頭',
  BODY: '身体',
  FEET: '足',
  ACCESSORY: '装飾',
  WEAPON: '武器',
  CONSUMABLE: '道具'
};