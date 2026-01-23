// src/constants/data.jsx
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
  UNPARALYZE: { id: 'unparalyze', name: '気付け薬', effect: { type: 'CURE', ailment: 'PARALYSIS' }, icon: <Pill className="text-yellow-500" />, desc: '麻痺を回復', price: 30 },
  POWER_DRUG: { id: 'power_drug', name: '鬼人薬', effect: { type: 'BUFF', stat: 'str', value: 10, duration: 15000 }, icon: <Flame className="text-orange-500" />, desc: '15秒間、力+10', price: 200 },
  HARD_SHELL: { id: 'hard_shell', name: '硬化薬', effect: { type: 'BUFF', stat: 'vit', value: 10, duration: 15000 }, icon: <Shield className="text-blue-500" />, desc: '15秒間、耐久+10', price: 200 },
  SPEED_POT: { id: 'speed_pot', name: '疾風の薬', effect: { type: 'BUFF', stat: 'agi', value: 10, duration: 15000 }, icon: <Wind className="text-cyan-500" />, desc: '15秒間、素早さ+10', price: 200 },
};

export const MONSTER_TYPES = {
  SLIME: { name: 'スライム', illustration: SVGs.Slime, hpMod: 0.8 },
  BAT: { name: 'こうもり', illustration: SVGs.Bat, hpMod: 0.6 },
  GOBLIN: { name: 'ゴブリン', illustration: SVGs.Goblin, hpMod: 1.0, actions: ['POISON'] },
  WOLF: { name: 'オオカミ', illustration: SVGs.Wolf, hpMod: 1.2 },
  SKELETON: { name: 'ガイコツ', illustration: SVGs.Skeleton, hpMod: 1.1, actions: ['PARALYSIS'] },
  DRAGON: { name: 'ドラゴン', illustration: SVGs.Dragon, hpMod: 3.0, actions: ['POISON', 'PARALYSIS'] },
  DEMON: { name: 'デーモン', illustration: SVGs.Demon, hpMod: 3.5, actions: ['PARALYSIS'] },
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

export const WORD_LISTS = {
  EASY: [
    { display: 'ねこ', romaji: 'neko' }, { display: 'いぬ', romaji: 'inu' }, { display: 'うし', romaji: 'ushi' },
    { display: 'うま', romaji: 'uma' }, { display: 'さる', romaji: 'saru' }, { display: 'くま', romaji: 'kuma' },
    { display: 'とり', romaji: 'tori' }, { display: 'かめ', romaji: 'kame' }, { display: 'かに', romaji: 'kani' },
    { display: 'たこ', romaji: 'tako' }, { display: 'いか', romaji: 'ika' }, { display: 'さかな', romaji: 'sakana' },
    { display: 'りんご', romaji: 'ringo' }, { display: 'みかん', romaji: 'mikan' }, { display: 'ぶどう', romaji: 'budou' },
    { display: 'めろん', romaji: 'meron' }, { display: 'いちご', romaji: 'ichigo' }, { display: 'ばなな', romaji: 'banana' },
    { display: 'とまと', romaji: 'tomato' }, { display: 'なす', romaji: 'nasu' }, { display: 'にんじん', romaji: 'ninjin' },
    { display: 'ぱん', romaji: 'pan' }, { display: 'ごはん', romaji: 'gohan' }, { display: 'たまご', romaji: 'tamago' },
    { display: 'みるく', romaji: 'miruku' }, { display: 'みず', romaji: 'mizu' }, { display: 'やま', romaji: 'yama' },
    { display: 'かわ', romaji: 'kawa' }, { display: 'うみ', romaji: 'umi' }, { display: 'そら', romaji: 'sora' },
    { display: 'はな', romaji: 'hana' }, { display: 'き', romaji: 'ki' }, { display: 'くるま', romaji: 'kuruma' },
    { display: 'ばす', romaji: 'basu' }, { display: 'でんしゃ', romaji: 'densha' }, { display: 'ふね', romaji: 'fune' },
    { display: 'あか', romaji: 'aka' }, { display: 'あお', romaji: 'ao' }, { display: 'しろ', romaji: 'shiro' },
    { display: 'くろ', romaji: 'kuro' }, { display: 'ゆめ', romaji: 'yume' }, { display: 'えがお', romaji: 'egao' },
    { display: 'げんき', romaji: 'genki' }, { display: 'おかし', romaji: 'okashi' }, { display: 'けーき', romaji: 'keiki' },
  ],
  NORMAL: [
    { display: 'スライム', romaji: 'suraimu' }, { display: 'ゴブリン', romaji: 'goburin' }, { display: 'ドラゴン', romaji: 'doragon' },
    { display: '魔法', romaji: 'mahou' }, { display: '剣', romaji: 'ken' }, { display: '冒険', romaji: 'bouken' },
    { display: '伝説', romaji: 'densetsu' }, { display: '攻撃', romaji: 'kougeki' }, { display: '防御', romaji: 'bougyo' },
    { display: '回復', romaji: 'kaifuku' }, { display: '宝箱', romaji: 'takarabako' }, { display: '迷宮', romaji: 'meikyuu' },
    { display: '勇者', romaji: 'yuusha' }, { display: '魔王', romaji: 'maou' }, { display: '戦士', romaji: 'senshi' },
    { display: '協力', romaji: 'kyouryoku' }, { display: '対戦', romaji: 'taisen' }, { display: '勝利', romaji: 'shouri' },
    { display: '敗北', romaji: 'haiboku' }, { display: '経験値', romaji: 'keikenchi' }, { display: '覚醒', romaji: 'kakusei' },
    { display: '疾風', romaji: 'shippuu' }, { display: '雷鳴', romaji: 'raimei' }, { display: '紅蓮', romaji: 'guren' },
    { display: '蒼穹', romaji: 'soukyuu' },
  ]
};

export const RARITY = {
  COMMON: { id: 'common', name: 'コモン', color: 'text-slate-500', chance: 0.6, priceMod: 1 },
  RARE: { id: 'rare', name: 'レア', color: 'text-blue-600', chance: 0.3, priceMod: 2 },
  EPIC: { id: 'epic', name: 'エピック', color: 'text-purple-600', chance: 0.09, priceMod: 5 },
  LEGENDARY: { id: 'legendary', name: 'レジェンダリー', color: 'text-yellow-600', chance: 0.01, priceMod: 10 },
};

export const ITEM_TYPES = {
  HEAD: '頭',
  BODY: '身体',
  FEET: '足',
  ACCESSORY: '装飾',
  WEAPON: '武器',
  CONSUMABLE: '道具'
};