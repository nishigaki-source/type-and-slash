import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sword, Shield, Zap, Heart, User, Sparkles, Scroll, Coins, Backpack, Play, Users, Share2, LogOut, ArrowRight, Skull, Trophy, Star, Ghost, AlertTriangle, Scale, Target, Wind, Clover, ShoppingBag, RefreshCw, Settings, XCircle, Feather, FlaskConical, Pill, Activity, Flame, GraduationCap, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';

// --- Firebase初期化 ---
// Firebaseコンソールで取得したご自身の値に書き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyDZD1jRgAfvpDuKpr9y-BSahmtHVb6Y8oU",
  authDomain: "type-and-slash-game.firebaseapp.com",
  projectId: "type-and-slash-game",
  storageBucket: "type-and-slash-game.firebasestorage.app",
  messagingSenderId: "898114139190",
  appId: "1:898114139190:web:9b7adeb1a582c84c821497"
};

const appId = "type-and-slash-v1"; // 任意のIDでOK
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- グラフィックアセット (SVGイラスト) ---

const getSkinColor = (race) => {
  switch (race) {
    case 'ELF': return '#fecaca';
    case 'DEMON': return '#c4b5fd';
    case 'DWARF': return '#fdba74';
    default: return '#fca5a5';
  }
};

// 女性らしい目を描画するコンポーネント
const FemaleEyes = () => (
  <g>
    <path d="M40,43 Q43,40 46,43" stroke="#334155" strokeWidth="1.5" fill="none" />
    <path d="M54,43 Q57,40 60,43" stroke="#334155" strokeWidth="1.5" fill="none" />
    <circle cx="43" cy="44" r="2.5" fill="#1e293b" />
    <circle cx="57" cy="44" r="2.5" fill="#1e293b" />
    {/* まつげ */}
    <path d="M39,42 L38,39" stroke="#334155" strokeWidth="1" />
    <path d="M61,42 L62,39" stroke="#334155" strokeWidth="1" />
  </g>
);

const MaleEyes = () => (
  <g>
    <circle cx="43" cy="42" r="2" fill="#334155" />
    <circle cx="57" cy="42" r="2" fill="#334155" />
    <path d="M40,38 L46,40" stroke="#334155" strokeWidth="1" />
    <path d="M60,38 L54,40" stroke="#334155" strokeWidth="1" />
  </g>
);

const SVGs = {
  TownBg: () => (
    <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full object-cover -z-10" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="groundGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#skyGradient)" />
      <path d="M0,450 L200,250 L400,450 Z" fill="#94a3b8" opacity="0.6" />
      <path d="M300,450 L600,200 L900,450 Z" fill="#64748b" opacity="0.6" />
      <rect y="450" width="800" height="150" fill="url(#groundGradient)" />
      <path d="M300,600 L400,450 L500,600 Z" fill="#d6d3d1" />
      <rect x="50" y="350" width="150" height="120" fill="#fecaca" stroke="#991b1b" strokeWidth="2"/>
      <path d="M30,350 L125,270 L220,350 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2"/>
      <rect x="100" y="400" width="50" height="70" fill="#78350f" />
      <rect x="70" y="380" width="30" height="30" fill="#bae6fd" stroke="#1e3a8a" strokeWidth="2" />
      <rect x="600" y="320" width="180" height="150" fill="#fde68a" stroke="#92400e" strokeWidth="2"/>
      <path d="M580,320 L790,320 L780,280 L590,280 Z" fill="#b45309" stroke="#78350f" strokeWidth="2"/>
      <rect x="660" y="390" width="60" height="80" fill="#78350f" />
      <text x="690" y="310" fontSize="24" textAnchor="middle" fill="white" fontWeight="bold" fontFamily="sans-serif">ITEM SHOP</text>
      
      <rect x="350" y="300" width="200" height="180" fill="#e2e8f0" stroke="#475569" strokeWidth="2"/>
      <path d="M330,300 L570,300 L550,220 L350,220 Z" fill="#64748b" stroke="#334155" strokeWidth="2"/>
      <rect x="420" y="400" width="60" height="80" fill="#475569" />
      <text x="450" y="280" fontSize="20" textAnchor="middle" fill="white" fontWeight="bold" fontFamily="serif">GUILD</text>

      <path d="M100,100 Q130,70 160,100 T220,100" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" opacity="0.8"/>
      <path d="M500,150 Q530,120 560,150 T620,150" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" opacity="0.8"/>
    </svg>
  ),
  GuildBg: () => (
    <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full object-cover -z-10" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wallGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f2e18" />
          <stop offset="100%" stopColor="#2a1d0d" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#wallGradient)" />
      <rect x="50" width="60" height="600" fill="#5c4024" />
      <rect x="690" width="60" height="600" fill="#5c4024" />
      <rect x="160" y="80" width="480" height="300" fill="#4a3520" stroke="#291d12" strokeWidth="8" />
      <rect x="170" y="90" width="460" height="280" fill="#2e2216" />
      <g opacity="0.8">
        <rect x="200" y="110" width="100" height="130" fill="#f3e5ab" transform="rotate(-3 250 175)" />
        <line x1="210" y1="130" x2="290" y2="130" stroke="#5c4024" strokeWidth="2" transform="rotate(-3 250 175)"/>
        <line x1="210" y1="150" x2="290" y2="150" stroke="#5c4024" strokeWidth="2" transform="rotate(-3 250 175)"/>
        <rect x="350" y="120" width="100" height="130" fill="#f3e5ab" transform="rotate(2 400 185)" />
        <rect x="370" y="140" width="60" height="60" fill="#ef4444" opacity="0.3" transform="rotate(2 400 185)"/>
        <rect x="500" y="110" width="100" height="130" fill="#f3e5ab" transform="rotate(-1 550 175)" />
      </g>
      <rect y="450" width="800" height="150" fill="#6b4c2e" stroke="#3d2b1a" strokeWidth="4" />
      <path d="M600,420 Q620,380 650,350 L640,430 Z" fill="#f8fafc" stroke="#94a3b8" />
      <rect x="620" y="430" width="30" height="30" fill="#1e293b" />
    </svg>
  ),
  Fighter: ({ gender, race }) => {
    const skin = getSkinColor(race);
    const isFemale = gender === 'FEMALE';
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <circle cx="50" cy="50" r="45" fill="#e2e8f0" />
        {isFemale && <path d="M25,40 Q10,70 30,90 Q60,95 85,80 Q90,50 65,35" fill="#fbbf24" />} {/* 女性用髪 */}
        <path d="M20,90 Q50,110 80,90 L80,60 Q50,80 20,60 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2"/>
        <rect x="30" y="60" width="40" height="30" fill="#cbd5e1" />
        {race === 'ELF' ? (<><path d="M28,45 L15,35 L28,40 Z" fill={skin} /><path d="M72,45 L85,35 L72,40 Z" fill={skin} /></>) : (<><circle cx="28" cy="48" r="4" fill={skin} /><circle cx="72" cy="48" r="4" fill={skin} /></>)}
        <circle cx="50" cy="45" r="22" fill={skin} />
        {isFemale ? <FemaleEyes /> : <MaleEyes />}
        {race === 'DWARF' && !isFemale && <path d="M35,55 Q50,75 65,55 L65,65 Q50,85 35,65 Z" fill="#78350f" />}
        <path d="M30,35 Q50,25 70,35 L70,25 Q50,15 30,25 Z" fill="#64748b" />
        <rect x="48" y="22" width="4" height="15" fill="#f8fafc" />
        <path d="M30,35 Q50,45 70,35" fill="none" stroke={isFemale ? "#fbbf24" : "#f59e0b"} strokeWidth="3" />
        {race === 'DEMON' && <><path d="M35,30 L25,15 L32,25" fill="#facc15" stroke="#b45309" strokeWidth="1" /><path d="M65,30 L75,15 L68,25" fill="#facc15" stroke="#b45309" strokeWidth="1" /></>}
        <path d="M80,30 L95,15 L90,10 L75,25 L80,30" fill="#94a3b8" stroke="#475569" strokeWidth="1"/>
      </svg>
    );
  },
  Mage: ({ gender, race }) => {
    const skin = getSkinColor(race);
    const isFemale = gender === 'FEMALE';
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <circle cx="50" cy="50" r="45" fill="#e2e8f0" />
        {isFemale && <path d="M20,45 Q10,75 30,95 L70,95 Q90,75 80,45" fill="#a8a29e" />}
        <path d="M25,90 Q50,100 75,90 L70,55 Q50,65 30,55 Z" fill="#3b82f6" />
        {race === 'ELF' ? (<><path d="M30,45 L18,35 L30,40 Z" fill={skin} /><path d="M70,45 L82,35 L70,40 Z" fill={skin} /></>) : (<><circle cx="28" cy="48" r="4" fill={skin} /><circle cx="72" cy="48" r="4" fill={skin} /></>)}
        <circle cx="50" cy="45" r="20" fill={skin} />
        {isFemale ? <FemaleEyes /> : <MaleEyes />}
        {race === 'DWARF' && !isFemale && <path d="M38,55 Q50,70 62,55 L60,65 Q50,80 40,65 Z" fill="#e7e5e4" />}
        <path d="M20,40 L80,40 L50,5 Z" fill="#1e3a8a" />
        <ellipse cx="50" cy="40" rx="35" ry="5" fill="#1e40af" />
        <path d="M25,40 L50,15 L75,40" fill="none" stroke="#fbbf24" strokeWidth="2" />
        {race === 'DEMON' && <><path d="M30,35 L20,20 L32,32" fill="#facc15" stroke="#b45309" strokeWidth="1" /><path d="M70,35 L80,20 L68,32" fill="#facc15" stroke="#b45309" strokeWidth="1" /></>}
        <line x1="85" y1="30" x2="85" y2="80" stroke="#78350f" strokeWidth="3" />
        <circle cx="85" cy="30" r="6" fill="#ef4444" />
      </svg>
    );
  },
  Monk: ({ gender, race }) => {
    const skin = getSkinColor(race);
    const isFemale = gender === 'FEMALE';
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <circle cx="50" cy="50" r="45" fill="#e2e8f0" />
        <path d="M25,90 Q50,100 75,90 L75,55 Q50,65 25,55 Z" fill="#f97316" />
        <line x1="25" y1="55" x2="75" y2="90" stroke="#7c2d12" strokeWidth="1" opacity="0.3"/>
        <circle cx="50" cy="40" r="20" fill={skin} />
        {race === 'ELF' ? (<><path d="M30,40 L18,30 L30,35 Z" fill={skin} /><path d="M70,40 L82,30 L70,35 Z" fill={skin} /></>) : (<><circle cx="28" cy="42" r="4" fill={skin} /><circle cx="72" cy="42" r="4" fill={skin} /></>)}
        {isFemale ? (
           <><path d="M30,35 Q50,15 70,35" fill="#4b5563" /><circle cx="50" cy="20" r="8" fill="#4b5563" /><circle cx="50" cy="20" r="9" fill="none" stroke="#f43f5e" strokeWidth="2" /></>
        ) : (
           <path d="M30,30 Q50,10 70,30" fill="#4b5563" opacity="0.5" />
        )}
        <rect x="30" y="30" width="40" height="6" fill="#fff" />
        <circle cx="50" cy="33" r="2" fill="#ef4444" />
        {isFemale ? <FemaleEyes /> : <MaleEyes />}
        {race === 'DWARF' && !isFemale && <path d="M35,50 Q50,70 65,50 L65,60 Q50,80 35,60 Z" fill="#4b5563" />}
        {race === 'DEMON' && <><path d="M32,28 L25,15 L35,25" fill="#facc15" stroke="#b45309" strokeWidth="1" /><path d="M68,28 L75,15 L65,25" fill="#facc15" stroke="#b45309" strokeWidth="1" /></>}
        <circle cx="25" cy="65" r="8" fill={skin} stroke="#7c2d12" strokeWidth="1"/>
        <circle cx="75" cy="55" r="8" fill={skin} stroke="#7c2d12" strokeWidth="1"/>
      </svg>
    );
  },
  Archer: ({ gender, race }) => {
    const skin = getSkinColor(race);
    const isFemale = gender === 'FEMALE';
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <circle cx="50" cy="50" r="45" fill="#e2e8f0" />
        {isFemale && <path d="M25,45 Q10,70 20,95 L80,95 Q90,70 75,45" fill="#fcd34d" />}
        <path d="M30,90 Q50,100 70,90 L70,55 Q50,65 30,55 Z" fill="#16a34a" />
        <circle cx="50" cy="45" r="20" fill={skin} />
        {race === 'ELF' ? (<><path d="M28,45 L10,30 L28,40 Z" fill={skin} /><path d="M72,45 L90,30 L72,40 Z" fill={skin} /></>) : (<><circle cx="28" cy="48" r="4" fill={skin} /><circle cx="72" cy="48" r="4" fill={skin} /></>)}
        {isFemale ? <FemaleEyes /> : <MaleEyes />}
        {race === 'DWARF' && !isFemale && <path d="M38,55 Q50,70 62,55 L60,65 Q50,80 40,65 Z" fill="#92400e" />}
        <path d="M25,45 Q50,10 75,45 L70,55 Q50,25 30,55 Z" fill="#166534" opacity="0.9"/>
        {race === 'DEMON' && <><path d="M35,35 L28,20 L38,30" fill="#facc15" stroke="#b45309" strokeWidth="1" /><path d="M65,35 L72,20 L62,30" fill="#facc15" stroke="#b45309" strokeWidth="1" /></>}
        <path d="M15,30 Q35,50 15,70" fill="none" stroke="#78350f" strokeWidth="3" />
        <line x1="15" y1="30" x2="15" y2="70" stroke="#cbd5e1" strokeWidth="1" />
      </svg>
    );
  },
  // ... (モンスターはそのまま)
  Slime: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl animate-bounce-slow"><path d="M20,80 Q50,90 80,80 Q90,60 80,40 Q50,10 20,40 Q10,60 20,80 Z" fill="#3b82f6" opacity="0.8" /><ellipse cx="35" cy="45" rx="5" ry="7" fill="white" /><circle cx="37" cy="45" r="2" fill="black" /><ellipse cx="65" cy="45" rx="5" ry="7" fill="white" /><circle cx="63" cy="45" r="2" fill="black" /><path d="M45,60 Q50,65 55,60" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/></svg>),
  Bat: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl"><path d="M30,50 Q10,30 10,60 Q20,70 30,60 L50,70 L70,60 Q80,70 90,60 Q90,30 70,50 L50,40 Z" fill="#475569" /><circle cx="40" cy="55" r="3" fill="#facc15" /><circle cx="60" cy="55" r="3" fill="#facc15" /><path d="M48,65 L50,70 L52,65" fill="white" /></svg>),
  Goblin: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl"><rect x="40" y="60" width="20" height="30" fill="#57534e" /><circle cx="50" cy="45" r="25" fill="#4ade80" /><path d="M25,45 L10,35 L28,38 Z" fill="#4ade80" /><path d="M75,45 L90,35 L72,38 Z" fill="#4ade80" /><circle cx="40" cy="40" r="4" fill="#fef08a" /><circle cx="60" cy="40" r="4" fill="#fef08a" /><circle cx="40" cy="40" r="1" fill="black" /><circle cx="60" cy="40" r="1" fill="black" /><path d="M40,55 Q50,60 60,55" fill="none" stroke="black" strokeWidth="2" /><path d="M42,55 L44,58 L46,55" fill="white" /><path d="M54,55 L56,58 L58,55" fill="white" /><path d="M70,60 L90,20 Q95,15 85,25 L75,55 Z" fill="#78350f" /></svg>),
  Wolf: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl"><path d="M20,60 Q30,40 50,40 Q70,40 80,60 Q90,70 80,80 Q50,90 20,80 Q10,70 20,60 Z" fill="#94a3b8" /><path d="M30,45 L20,20 L40,40 Z" fill="#94a3b8" /><path d="M70,45 L80,20 L60,40 Z" fill="#94a3b8" /><circle cx="40" cy="60" r="3" fill="#ef4444" /><circle cx="60" cy="60" r="3" fill="#ef4444" /><path d="M45,75 L50,80 L55,75" fill="black" /></svg>),
  Skeleton: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl"><rect x="42" y="60" width="16" height="30" fill="#e2e8f0" /><circle cx="50" cy="40" r="22" fill="#f8fafc" /><circle cx="42" cy="38" r="5" fill="#1e293b" /><circle cx="58" cy="38" r="5" fill="#1e293b" /><path d="M45,50 L55,50" stroke="#1e293b" strokeWidth="2" /><line x1="48" y1="48" x2="48" y2="52" stroke="#1e293b" strokeWidth="1" /><line x1="52" y1="48" x2="52" y2="52" stroke="#1e293b" strokeWidth="1" /></svg>),
  Dragon: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl"><path d="M10,40 Q30,10 50,40" fill="#dc2626" opacity="0.8"/><path d="M90,40 Q70,10 50,40" fill="#dc2626" opacity="0.8"/><path d="M30,80 Q50,100 70,80 L70,40 Q50,20 30,40 Z" fill="#b91c1c" /><path d="M30,40 L40,20 L50,40" fill="#ef4444" /><path d="M30,45 Q50,30 70,45 L60,70 Q50,80 40,70 Z" fill="#b91c1c" /><circle cx="40" cy="50" r="4" fill="#fbbf24" /><circle cx="60" cy="50" r="4" fill="#fbbf24" /><path d="M45,65 Q50,70 55,65" fill="none" stroke="black" strokeWidth="2" /><path d="M35,35 L20,20" stroke="#fef08a" strokeWidth="3" /><path d="M65,35 L80,20" stroke="#fef08a" strokeWidth="3" /></svg>),
  Demon: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl"><path d="M20,90 Q50,110 80,90 L75,40 Q50,30 25,40 Z" fill="#4c1d95" /><path d="M20,40 Q10,60 10,90" stroke="#1e1b4b" strokeWidth="5" fill="none"/><path d="M80,40 Q90,60 90,90" stroke="#1e1b4b" strokeWidth="5" fill="none"/><circle cx="50" cy="40" r="25" fill="#5b21b6" /><path d="M30,25 L20,10" stroke="#facc15" strokeWidth="4" /><path d="M70,25 L80,10" stroke="#facc15" strokeWidth="4" /><path d="M35,40 L45,45 L35,50 Z" fill="#ef4444" /><path d="M65,40 L55,45 L65,50 Z" fill="#ef4444" /><path d="M45,60 L42,65 L48,60" fill="white" /><path d="M55,60 L58,65 L52,60" fill="white" /></svg>)
};

// --- 定数・データ定義 ---

const GROWTH = {
  S: { min: 4, max: 6 },
  A: { min: 3, max: 5 },
  B: { min: 2, max: 4 },
  C: { min: 1, max: 3 },
  D: { min: 0, max: 2 },
};

const JOBS = {
  FIGHTER: { 
    id: 'fighter', name: 'ファイター', weapon: '剣', 
    Illustration: SVGs.Fighter,
    growth: { hp: 'A', str: 'A', vit: 'A', dex: 'C', agi: 'C', luk: 'C' },
    initMod: { str: 2, vit: 1, dex: -1, agi: -1, luk: 0 }
  },
  MAGE: { 
    id: 'mage', name: 'メイジ', weapon: '杖', 
    Illustration: SVGs.Mage,
    growth: { hp: 'C', str: 'D', vit: 'C', dex: 'A', agi: 'B', luk: 'B' },
    initMod: { str: -2, vit: -1, dex: 2, agi: 1, luk: 1 }
  },
  MONK: { 
    id: 'monk', name: 'モンク', weapon: 'ナックル', 
    Illustration: SVGs.Monk,
    growth: { hp: 'S', str: 'B', vit: 'B', dex: 'B', agi: 'B', luk: 'C' },
    initMod: { str: 1, vit: 1, dex: 0, agi: 0, luk: -1 }
  },
  ARCHER: { 
    id: 'archer', name: 'アーチャー', weapon: '弓', 
    Illustration: SVGs.Archer,
    growth: { hp: 'B', str: 'C', vit: 'C', dex: 'S', agi: 'A', luk: 'B' },
    initMod: { str: 0, vit: -1, dex: 2, agi: 2, luk: 0 }
  },
};

const CONSUMABLES = {
  POTION_S: { id: 'potion_s', name: 'ポーション', effect: { type: 'HEAL', value: 50 }, icon: <FlaskConical className="text-red-500" />, desc: 'HPを50回復', price: 50 },
  POTION_M: { id: 'potion_m', name: 'ハイポーション', effect: { type: 'HEAL', value: 150 }, icon: <FlaskConical className="text-red-600" />, desc: 'HPを150回復', price: 150 },
  ANTIDOTE: { id: 'antidote', name: '毒消し草', effect: { type: 'CURE', ailment: 'POISON' }, icon: <Clover className="text-green-500" />, desc: '毒を回復', price: 30 },
  UNPARALYZE: { id: 'unparalyze', name: '気付け薬', effect: { type: 'CURE', ailment: 'PARALYSIS' }, icon: <Pill className="text-yellow-500" />, desc: '麻痺を回復', price: 30 },
  POWER_DRUG: { id: 'power_drug', name: '鬼人薬', effect: { type: 'BUFF', stat: 'str', value: 10, duration: 15000 }, icon: <Flame className="text-orange-500" />, desc: '15秒間、力+10', price: 200 },
  HARD_SHELL: { id: 'hard_shell', name: '硬化薬', effect: { type: 'BUFF', stat: 'vit', value: 10, duration: 15000 }, icon: <Shield className="text-blue-500" />, desc: '15秒間、耐久+10', price: 200 },
  SPEED_POT: { id: 'speed_pot', name: '疾風の薬', effect: { type: 'BUFF', stat: 'agi', value: 10, duration: 15000 }, icon: <Wind className="text-cyan-500" />, desc: '15秒間、素早さ+10', price: 200 },
};

const MONSTER_TYPES = {
  SLIME: { name: 'スライム', illustration: SVGs.Slime, hpMod: 0.8 },
  BAT: { name: 'こうもり', illustration: SVGs.Bat, hpMod: 0.6 },
  GOBLIN: { name: 'ゴブリン', illustration: SVGs.Goblin, hpMod: 1.0, actions: ['POISON'] },
  WOLF: { name: 'オオカミ', illustration: SVGs.Wolf, hpMod: 1.2 },
  SKELETON: { name: 'ガイコツ', illustration: SVGs.Skeleton, hpMod: 1.1, actions: ['PARALYSIS'] },
  DRAGON: { name: 'ドラゴン', illustration: SVGs.Dragon, hpMod: 3.0, actions: ['POISON', 'PARALYSIS'] },
  DEMON: { name: 'デーモン', illustration: SVGs.Demon, hpMod: 3.5, actions: ['PARALYSIS'] },
};

const RACES = {
  HUMAN: { id: 'human', name: '人間', mod: { str: 0, vit: 0, dex: 0, agi: 0, luk: 0 } },
  ELF: { id: 'elf', name: 'エルフ', mod: { str: -1, vit: -1, dex: 1, agi: 1, luk: 0 } },
  DEMON: { id: 'demon', name: '魔族', mod: { str: 2, vit: 0, dex: -1, agi: -1, luk: -1 } },
  DWARF: { id: 'dwarf', name: 'ドワーフ', mod: { str: 1, vit: 2, dex: -1, agi: -2, luk: 0 } },
};

const PERSONALITIES = {
  BRAVE: { id: 'brave', name: '勇敢', bonusStat: 'str' },
  GREEDY: { id: 'greedy', name: '強欲', bonusStat: 'luk' },
  PHILANTHROPIC: { id: 'philanthropic', name: '博愛', bonusStat: 'vit' },
  FLEXIBLE: { id: 'flexible', name: '柔軟', bonusStat: 'dex' },
};

const WORD_LISTS = {
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

const RARITY = {
  COMMON: { id: 'common', name: 'コモン', color: 'text-gray-400', chance: 0.6, priceMod: 1 },
  RARE: { id: 'rare', name: 'レア', color: 'text-blue-400', chance: 0.3, priceMod: 2 },
  EPIC: { id: 'epic', name: 'エピック', color: 'text-purple-400', chance: 0.09, priceMod: 5 },
  LEGENDARY: { id: 'legendary', name: 'レジェンダリー', color: 'text-yellow-400', chance: 0.01, priceMod: 10 },
};

const ITEM_TYPES = {
  HEAD: '頭',
  BODY: '身体',
  FEET: '足',
  ACCESSORY: '装飾',
  WEAPON: '武器',
  CONSUMABLE: '道具'
};

// --- ユーティリティ ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const getRarity = () => {
  const rand = Math.random();
  if (rand > 1 - RARITY.LEGENDARY.chance) return RARITY.LEGENDARY;
  if (rand > 1 - RARITY.LEGENDARY.chance - RARITY.EPIC.chance) return RARITY.EPIC;
  if (rand > 1 - RARITY.LEGENDARY.chance - RARITY.EPIC.chance - RARITY.RARE.chance) return RARITY.RARE;
  return RARITY.COMMON;
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 道具の生成ヘルパー
const generateConsumable = () => {
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

const generateItem = (playerLevel, jobType = null) => {
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
const calcInitialStats = (jobId, raceId, persId) => {
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
const growStats = (currentStats, jobId, levelsToGrow = 1) => {
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
  return { newStats, gains }; // gainsは1回分の成長量ではなく合計成長量(レベルアップ表示用には不向きかもだが今回は単純化)
};

const calculateEffectiveStats = (player, equipped, buffs = {}) => {
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

// --- サブコンポーネント ---

// 認証画面
const AuthScreen = ({ onLogin, onGuest, onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        // 新規登録成功後、自動ログイン状態になる
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(); // ログイン成功コールバック
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white animate-fade-in relative px-4">
      <SVGs.TownBg />
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="relative z-10 w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">
          {isRegistering ? '新規冒険者登録' : 'ギルドログイン'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">メールアドレス</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded pl-10 p-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="adventurer@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">パスワード</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded pl-10 p-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-lg font-bold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" /> : (isRegistering ? <UserPlus /> : <LogIn />)}
            {isRegistering ? '登録して開始' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            {isRegistering ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントをお持ちでない方はこちら'}
          </button>
          
          <div className="border-t border-slate-700 pt-4">
            <button
              onClick={onGuest}
              className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-1 w-full py-2 hover:bg-slate-700 rounded transition-colors"
            >
              ゲストとして遊ぶ（データ保存なし） <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="pt-2">
             <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-400">タイトルへ戻る</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// タイトル画面
const TitleScreen = ({ player, onStartNew, onResume, onDelete, difficulty, setDifficulty, onShowAuth }) => (
  <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white space-y-8 animate-fade-in relative px-4">
    <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 drop-shadow-lg text-center">
      TYPE & SLASH
    </h1>
    <p className="text-gray-400">タイピング・ハックアンドスラッシュ</p>
    
    <div className="max-w-2xl bg-black/60 p-6 rounded-lg backdrop-blur-sm border border-slate-600 text-sm leading-relaxed text-gray-300 shadow-xl">
      <h3 className="text-yellow-500 font-bold mb-2 text-center text-lg">STORY</h3>
      <p className="mb-2">大陸の辺境で発見された謎の「無限遺跡」。そこは入るたびに構造が変化し、見たこともない財宝と凶悪な魔物がひしめく場所だった。</p>
      <p className="mb-2">この発見により、遺跡の入り口には瞬く間に「始まりの町」が形成され、富と名声を求める者たちが世界中から集まった。</p>
      <p className="mb-2">人間、エルフ、魔族、ドワーフ……種族間の確執を超え、彼らはパーティを組み、遺跡の深淵へと挑む。</p>
      <p className="text-center text-blue-200 mt-2 font-bold">遺跡の奥底には「願いを一つだけ叶える至宝」があるという噂がまことしやかに囁かれている。</p>
    </div>

    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-64 shadow-lg">
      <div className="text-center text-sm text-gray-400 mb-2 flex items-center justify-center gap-1">
        <Settings size={14}/> モード設定
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => setDifficulty('EASY')}
          className={`flex-1 py-2 rounded text-sm font-bold transition-all ${difficulty === 'EASY' ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}`}
        >
          かんたん
          <div className="text-[10px] font-normal">ひらがな</div>
        </button>
        <button 
          onClick={() => setDifficulty('NORMAL')}
          className={`flex-1 py-2 rounded text-sm font-bold transition-all ${difficulty === 'NORMAL' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}`}
        >
          ふつう
          <div className="text-[10px] font-normal">漢字あり</div>
        </button>
      </div>
    </div>

    {!player ? (
      <button 
        onClick={onShowAuth}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-xl font-bold transition-all transform hover:scale-105 shadow-blue-500/50 shadow-lg"
      >
        冒険を始める
      </button>
    ) : (
      <div className="flex flex-col space-y-4 w-64">
        <button 
          onClick={onResume}
          className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
        >
          <Play size={20}/> 冒険を再開 (Lv.{player.level})
        </button>
        
        <button 
          onClick={onDelete}
          className="w-full py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-lg text-sm"
        >
          データを削除
        </button>
      </div>
    )}
    <div className="text-xs text-gray-600 mt-10">Ver 3.1 (Guest & Auth & Female Icon Update)</div>
  </div>
);

// 転職画面
const ClassChangeScreen = ({ player, onChangeClass, onBack }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  const COST = 1000;
  const canAfford = player.gold >= COST;

  const handleConfirm = () => {
    if (!selectedJob) return;
    if (!canAfford) {
      alert('ゴールドが足りません！');
      return;
    }
    if (window.confirm(`本当に ${JOBS[selectedJob].name} に転職しますか？\n(費用: ${COST} G, 武器は外れます, ステータスは再計算されます)`)) {
      onChangeClass(selectedJob, COST);
    }
  };

  return (
    <div className="h-full relative overflow-y-auto text-slate-800">
       <SVGs.GuildBg />
       
       <div className="min-h-full p-8 flex items-center justify-center">
         <div className="max-w-4xl w-full bg-[#fdf6e3] rounded-sm shadow-2xl p-8 border-4 border-[#8b5cf6] relative">
            <div className="text-center mb-6 border-b-2 border-[#8b5cf6] pb-4">
               <h2 className="text-4xl font-serif font-bold text-[#4c1d95] flex items-center justify-center gap-3">
                 <GraduationCap size={32} /> 職業変更手続き
               </h2>
               <p className="text-[#6d28d9] mt-2 font-serif italic">Class Change Service - Fee: {COST} G</p>
            </div>

            <div className="flex justify-between items-center mb-6 bg-white/50 p-4 rounded border border-[#ddd6fe]">
               <div className="font-bold text-[#5b21b6]">現在の所持金: <span className="text-xl">{player.gold} G</span></div>
               <div className="font-bold text-[#5b21b6]">現在の職業: <span className="text-xl">{JOBS[player.job].name}</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               {Object.keys(JOBS).map(key => {
                 const JobIll = JOBS[key].Illustration;
                 const isCurrent = player.job === key;
                 const isSelected = selectedJob === key;
                 
                 if (isCurrent) return null; // 現在の職は表示しない（または無効化）

                 return (
                   <button
                     key={key}
                     onClick={() => setSelectedJob(key)}
                     className={`p-4 rounded-lg border-2 flex flex-col items-center gap-3 transition-all ${isSelected ? 'bg-[#f3e8ff] border-[#8b5cf6] shadow-lg scale-105' : 'bg-white border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                   >
                     <div className="w-20 h-20 bg-slate-200 rounded-full border-2 border-slate-300 overflow-hidden">
                        <JobIll gender={player.gender} race={player.race} />
                     </div>
                     <div className="font-bold text-lg text-[#6d28d9]">{JOBS[key].name}</div>
                     <div className="text-xs text-slate-500 text-center">
                        得意ステータス:<br/>
                        {Object.entries(JOBS[key].growth).filter(([k,v]) => v === 'S' || v === 'A').map(([k]) => k.toUpperCase()).join(', ')}
                     </div>
                   </button>
                 );
               })}
            </div>

            <div className="flex justify-center gap-4">
               <button 
                 onClick={onBack}
                 className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded font-bold"
               >
                 キャンセル
               </button>
               <button 
                 onClick={handleConfirm}
                 disabled={!selectedJob || !canAfford}
                 className={`px-12 py-3 rounded font-bold text-xl shadow-lg transition-all flex items-center gap-2 ${(!selectedJob || !canAfford) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white transform hover:scale-105'}`}
               >
                 転職する
               </button>
            </div>
         </div>
       </div>
    </div>
  );
};

// キャラクター作成
const CharCreateScreen = ({ onCreate }) => {
  const [form, setForm] = useState({ name: '冒険者', job: 'FIGHTER', race: 'HUMAN', gender: 'MALE', personality: 'BRAVE' });

  return (
    <div className="h-full relative overflow-y-auto text-slate-800">
      <SVGs.GuildBg />
      
      <div className="min-h-full p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-[#fdf6e3] rounded-sm shadow-2xl p-8 border-4 border-[#8b5cf6] relative">
          <div className="text-center mb-8 border-b-2 border-[#8b5cf6] pb-4">
            <h2 className="text-4xl font-serif font-bold text-[#4c1d95] flex items-center justify-center gap-3">
              <Feather size={32} /> 冒険者ギルド 新規登録
            </h2>
            <p className="text-[#6d28d9] mt-2 font-serif italic">Adventurer's Guild Registration Form</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#5b21b6] mb-1">氏名 (Name)</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white border-2 border-[#ddd6fe] rounded p-2 text-slate-800 focus:outline-none focus:border-[#8b5cf6] font-serif text-lg shadow-inner"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#5b21b6] mb-2">種族 (Race)</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(RACES).map(key => (
                    <button
                      key={key}
                      onClick={() => setForm({...form, race: key})}
                      className={`py-2 px-3 rounded border-2 text-sm font-bold transition-all ${form.race === key ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-md' : 'bg-white text-[#6d28d9] border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                    >
                      {RACES[key].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#5b21b6] mb-2">性別 (Gender)</label>
                  <div className="flex gap-2">
                    {['MALE', 'FEMALE'].map(g => (
                      <button
                        key={g}
                        onClick={() => setForm({...form, gender: g})}
                        className={`flex-1 py-2 rounded border-2 text-sm font-bold transition-all ${form.gender === g ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'bg-white text-[#6d28d9] border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                      >
                        {g === 'MALE' ? '男性' : '女性'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#5b21b6] mb-2">性格 (Nature)</label>
                  <select 
                    value={form.personality} 
                    onChange={e => setForm({...form, personality: e.target.value})}
                    className="w-full bg-white border-2 border-[#ddd6fe] rounded p-2 text-slate-800 font-bold"
                  >
                    {Object.keys(PERSONALITIES).map(key => (
                      <option key={key} value={key}>{PERSONALITIES[key].name} ({PERSONALITIES[key].bonusStat.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-sm font-bold text-[#5b21b6] mb-2">職業 (Class)</label>
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(JOBS).map(key => {
                  const JobIll = JOBS[key].Illustration;
                  const isSelected = form.job === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setForm({...form, job: key})}
                      className={`p-3 rounded-lg border-2 flex items-center gap-4 transition-all ${isSelected ? 'bg-[#f3e8ff] border-[#8b5cf6] shadow-md scale-[1.02]' : 'bg-white border-[#ddd6fe] hover:bg-[#f5f3ff]'}`}
                    >
                      <div className={`w-16 h-16 flex-shrink-0 rounded-full p-1 overflow-hidden border-2 ${isSelected ? 'bg-[#8b5cf6] border-[#7c3aed]' : 'bg-slate-200 border-slate-300'}`}>
                        {isSelected ? <JobIll gender={form.gender} race={form.race} /> : <div className="opacity-50"><JobIll gender={form.gender} race={form.race} /></div>}
                      </div>
                      <div className="text-left flex-1">
                        <div className={`font-bold text-lg ${isSelected ? 'text-[#6d28d9]' : 'text-slate-600'}`}>{JOBS[key].name}</div>
                        <div className="text-xs text-slate-500">得意: {Object.entries(JOBS[key].growth).filter(([k,v]) => v === 'S' || v === 'A').map(([k]) => k.toUpperCase()).join(', ')}</div>
                      </div>
                      {isSelected && <div className="text-[#8b5cf6]"><div className="w-4 h-4 bg-[#8b5cf6] rounded-full"></div></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => onCreate(form)}
              className="px-12 py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 border-4 border-[#ddd6fe]"
            >
              登録して冒険へ <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopScreen = ({ player, inventory, equipped, setPlayer, setInventory, onBack, shopItems, onRefreshShop }) => {
  const [tab, setTab] = useState('BUY'); // BUY, SELL

  const handleBuy = (item) => {
    if (player.gold < item.value) {
      alert('ゴールドが足りません！');
      return;
    }
    setPlayer(prev => ({ ...prev, gold: prev.gold - item.value }));
    setInventory(prev => [...prev, item]);
    const newShopItems = shopItems.filter(i => i.id !== item.id);
    onRefreshShop(newShopItems);
  };

  const handleSell = (item) => {
    const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
    if (isEquipped) {
      alert('装備中のアイテムは売却できません！');
      return;
    }

    const sellPrice = Math.floor(item.value / 2);
    setPlayer(prev => ({ ...prev, gold: prev.gold + sellPrice }));
    setInventory(prev => prev.filter(i => i.id !== item.id));
  };

  return (
    <div className="h-full bg-slate-900 text-white flex flex-col">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shadow-md">
        <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag /> ショップ</h2>
        <div className="flex gap-4 items-center">
          <div className="text-yellow-400 font-bold flex items-center gap-1"><Coins size={16}/> {player.gold} G</div>
          <button onClick={onBack} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">町へ戻る</button>
        </div>
      </div>

      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setTab('BUY')}
          className={`flex-1 py-3 font-bold ${tab === 'BUY' ? 'bg-blue-900/50 text-blue-300 border-b-2 border-blue-500' : 'bg-slate-900 text-gray-500 hover:bg-slate-800'}`}
        >
          購入する
        </button>
        <button 
          onClick={() => setTab('SELL')}
          className={`flex-1 py-3 font-bold ${tab === 'SELL' ? 'bg-green-900/50 text-green-300 border-b-2 border-green-500' : 'bg-slate-900 text-gray-500 hover:bg-slate-800'}`}
        >
          売却する
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
        {tab === 'BUY' && (
          <div className="grid grid-cols-2 gap-3">
             {shopItems.length === 0 ? (
               <div className="col-span-2 text-center text-gray-500 py-10">売り切れです。ステージをクリアして入荷を待ちましょう。</div>
             ) : (
               shopItems.map(item => (
                 <div key={item.id} className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                   <div>
                     <div className={`text-sm font-bold ${item.type === 'CONSUMABLE' ? 'text-green-400' : RARITY[item.rarity.toUpperCase()].color}`}>{item.name}</div>
                     <div className="text-xs text-gray-500 mt-1">
                        {item.type === 'CONSUMABLE' ? '消耗品' : (
                          <>
                            {(item.stats?.atk || 0) > 0 && `ATK:${item.stats.atk} `}
                            {(item.stats?.def || 0) > 0 && `DEF:${item.stats.def} `}
                            <span className="text-gray-600">WT:{item.stats.wt}</span>
                          </>
                        )}
                     </div>
                   </div>
                   <button 
                     onClick={() => handleBuy(item)}
                     className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-white text-xs rounded flex flex-col items-center min-w-[60px]"
                   >
                     <span>購入</span>
                     <span className="text-[10px]">{item.value} G</span>
                   </button>
                 </div>
               ))
             )}
          </div>
        )}

        {tab === 'SELL' && (
          <div className="grid grid-cols-2 gap-3">
             {inventory.length === 0 ? (
               <div className="col-span-2 text-center text-gray-500 py-10">売却できるアイテムがありません</div>
             ) : (
               inventory.map(item => {
                 const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
                 return (
                   <div key={item.id} className={`bg-slate-800 p-3 rounded border flex justify-between items-center ${isEquipped ? 'border-yellow-600 opacity-70' : 'border-slate-700'}`}>
                     <div>
                       <div className={`text-sm font-bold ${item.type === 'CONSUMABLE' ? 'text-green-400' : RARITY[item.rarity.toUpperCase()].color}`}>
                         {item.name} {isEquipped && <span className="text-yellow-500 text-[10px] ml-1">[装備中]</span>}
                       </div>
                       <div className="text-xs text-gray-500 mt-1">
                          {item.type === 'CONSUMABLE' ? '消耗品' : (
                            <>
                              {(item.stats?.atk || 0) > 0 && `ATK:${item.stats.atk} `}
                              {(item.stats?.def || 0) > 0 && `DEF:${item.stats.def} `}
                            </>
                          )}
                       </div>
                     </div>
                     {!isEquipped ? (
                       <button 
                         onClick={() => handleSell(item)}
                         className="px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs rounded flex flex-col items-center min-w-[60px]"
                       >
                         <span>売却</span>
                         <span className="text-[10px]">{Math.floor(item.value / 2)} G</span>
                       </button>
                     ) : (
                       <div className="text-xs text-yellow-600 font-bold px-2">売却不可</div>
                     )}
                   </div>
                 );
               })
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const TownScreen = ({ player, inventory, equipped, onEquip, onUnequip, onStartBattle, onLogout, onOpenShop, onClassChange, difficulty }) => {
  const [selectedStage, setSelectedStage] = useState(1);
  const JobIll = JOBS[player.job].Illustration;
  
  const eff = calculateEffectiveStats(player, equipped);
  if (!eff) return null;

  const { base, equip, battle } = eff;
  
  return (
    <div className="h-full relative text-white flex flex-col overflow-hidden">
      <SVGs.TownBg />
      
      <div className="bg-slate-900/90 p-4 border-b border-slate-700 flex justify-between items-center shadow-md z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-900 rounded-full border-2 border-blue-500 overflow-hidden">
             <JobIll gender={player.gender} race={player.race} />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
                {player.name} 
                <span className="text-xs bg-blue-600 px-2 rounded">Lv.{player.level}</span>
            </div>
            <div className="text-xs text-gray-400">{RACES[player.race].name} / {JOBS[player.job].name}</div>
          </div>
          <div className="ml-4 w-32 hidden sm:block">
             <div className="text-xs text-gray-400 flex justify-between">
                <span>EXP</span>
                {(() => {
                  const percent = player.level > 0 ? Math.floor((player.exp / (player.level * 100)) * 100) : 0;
                  return <span>{isNaN(percent) ? 0 : percent}%</span>;
                })()}
             </div>
             <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
               <div className="bg-blue-400 h-full" style={{ width: `${player.level > 0 ? (player.exp / (player.level * 100)) * 100 : 0}%` }}></div>
             </div>
          </div>
        </div>
        <div className="flex gap-4 text-yellow-400 font-bold items-center">
          <div className="text-xs bg-slate-700 px-2 py-1 rounded text-gray-300">
             {difficulty === 'EASY' ? 'かんたん' : 'ふつう'}
          </div>
          <div className="flex items-center gap-1"><Coins size={16}/> {player.gold} G</div>
          <button onClick={onLogout} className="text-gray-400 hover:text-white"><LogOut size={20}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* 左パネル (半透明) */}
        <div className="w-1/3 bg-slate-900/85 p-6 overflow-y-auto border-r border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={18}/> ステータス</h3>
          
          <div className="space-y-4 mb-8">
            <div className="bg-slate-800/80 p-3 rounded">
               <div className="flex justify-between border-b border-slate-700 pb-1 mb-2">
                 <span className="text-gray-400">HP</span> 
                 <span className="font-mono text-green-400 font-bold">{battle.maxHp}</span>
               </div>
               <div className="flex justify-between border-b border-slate-700 pb-1 mb-2">
                 <span className="text-gray-400">ATK</span> 
                 <span className="font-mono text-red-400 font-bold">{battle.atk}</span>
               </div>
               <div className="flex justify-between border-b border-slate-700 pb-1">
                 <span className="text-gray-400">DEF</span> 
                 <span className="font-mono text-blue-400 font-bold">{battle.def}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">STR (力)</span> <span className="font-mono">{base.str}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">VIT (耐)</span> <span className="font-mono">{base.vit}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">DEX (器)</span> <span className="font-mono">{base.dex}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">AGI (速)</span> <span className="font-mono">{base.agi}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">LUK (運)</span> <span className="font-mono">{base.luk}</span></div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded text-xs space-y-1">
               <div className="flex justify-between items-center text-gray-400">
                  <span className="flex items-center gap-1"><Scale size={12}/> 総重量(WT)</span>
                  <span className={`${equip.wt > (base.str + base.vit) ? 'text-red-400' : 'text-white'}`}>{equip.wt}</span>
               </div>
               <div className="flex justify-between">
                  <span>命中率</span>
                  <span className={`${battle.hitRate < 100 ? 'text-yellow-400' : 'text-green-400'}`}>{Math.floor(battle.hitRate)}%</span>
               </div>
               <div className="flex justify-between">
                  <span>回避率</span>
                  <span>{Math.floor(battle.evasionRate)}%</span>
               </div>
               <div className="flex justify-between">
                  <span>クリティカル</span>
                  <span>{Math.floor(battle.critRate)}%</span>
               </div>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Shield size={18}/> 装備中</h3>
          <div className="space-y-3">
            {Object.keys(equipped).map(slot => (
              <div key={slot} className="bg-slate-800/80 p-2 rounded border border-slate-700">
                <div className="text-xs text-gray-500 mb-1 flex justify-between">
                  {ITEM_TYPES[slot]}
                  {equipped[slot] && <span className="text-[10px] text-gray-600">WT: {equipped[slot].stats?.wt || 0}</span>}
                </div>
                {equipped[slot] ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`text-sm font-bold ${RARITY[equipped[slot].rarity.toUpperCase()].color}`}>
                        {equipped[slot].name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {(equipped[slot].stats?.atk || 0) > 0 && `ATK:${equipped[slot].stats.atk} `}
                        {(equipped[slot].stats?.def || 0) > 0 && `DEF:${equipped[slot].stats.def} `}
                      </div>
                    </div>
                    <button 
                      onClick={() => onUnequip(slot)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-400"
                      title="外す"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">装備なし</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右パネル (半透明) */}
        <div className="w-2/3 p-6 flex flex-col bg-slate-900/80 backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Backpack size={18}/> 所持品</h3>
            {inventory.length === 0 ? (
              <p className="text-gray-500 text-center py-10">アイテムを持っていません</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {inventory.map(item => {
                  if (item.type === 'CONSUMABLE') return null; // 道具は別枠表示でも良いが今回は装備枠には出さない
                  const isEquipped = Object.values(equipped).some(e => e && e.id === item.id);
                  return (
                    <div key={item.id} className={`bg-slate-800/90 p-3 rounded border flex justify-between items-center group transition-colors ${isEquipped ? 'border-yellow-600 opacity-80' : 'border-slate-700 hover:border-blue-500'}`}>
                      <div>
                        <div className={`text-sm font-bold ${RARITY[item.rarity.toUpperCase()].color}`}>
                          {item.name} {isEquipped && <span className="text-yellow-500 text-[10px] ml-1">[装備中]</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                            {(item.stats?.atk || 0) > 0 && `ATK:${item.stats.atk} `}
                            {(item.stats?.def || 0) > 0 && `DEF:${item.stats.def} `}
                            <span className="text-gray-600 ml-1">WT:{item.stats?.wt || 0}</span>
                        </div>
                      </div>
                      {!isEquipped && (
                        <button 
                          onClick={() => onEquip(item)}
                          className="px-3 py-1 bg-slate-700 text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          装備
                        </button>
                      )}
                      {isEquipped && (
                        <div className="px-3 py-1 text-xs text-yellow-500 font-bold border border-yellow-600 rounded">
                           装備中
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* 道具リスト */}
                {inventory.filter(i => i.type === 'CONSUMABLE').map(item => (
                  <div key={item.id} className="bg-slate-800/90 p-3 rounded border border-green-900/50 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-green-400">{item.name}</div>
                      <div className="text-xs text-gray-500">{CONSUMABLES[item.consumableId]?.desc}</div>
                    </div>
                    <div className="text-xs text-gray-500">道具</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">ステージ選択</span>
              <select 
                value={selectedStage} 
                onChange={e => setSelectedStage(Number(e.target.value))}
                className="bg-slate-900 border border-slate-600 rounded p-2"
              >
                {[...Array(player.maxStage)].map((_, i) => (
                  <option key={i+1} value={i+1}>ステージ {i+1}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={onOpenShop}
                className="py-4 bg-yellow-700 hover:bg-yellow-600 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag size={24}/> ショップ
              </button>
              <button 
                onClick={onClassChange}
                className="py-4 bg-purple-700 hover:bg-purple-600 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <GraduationCap size={24}/> 転職
              </button>
              <button 
                onClick={() => onStartBattle(selectedStage)}
                className="py-4 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <Sword size={24}/> 出撃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BattleScreen = ({ battleState, setBattleState, player, equipped, inventory, setInventory, onWin, onLose, difficulty }) => {
  const [typed, setTyped] = useState('');
  const inputRef = useRef(null);
  const [animEffect, setAnimEffect] = useState(null); 
  const [damageAnim, setDamageAnim] = useState(null); 

  const enemy = battleState.enemies[battleState.currentEnemyIndex];
  const MonsterIll = (enemy && enemy.type && MONSTER_TYPES[enemy.type]) ? MONSTER_TYPES[enemy.type].illustration : SVGs.Slime;
  const PlayerIll = JOBS[player.job].Illustration;
  
  const eff = calculateEffectiveStats(player, equipped, battleState.buffs);

  useEffect(() => {
    if (battleState.isOver) return;

    const timer = setInterval(() => {
      setBattleState(prev => {
        if (prev.isOver) return prev;
        
        const now = Date.now();
        const delta = now - prev.lastTick;
        const currentEnemy = prev.enemies[prev.currentEnemyIndex];
        
        let newGauge = currentEnemy.currentAttackGauge + delta;
        let newPlayerHp = prev.playerHp;
        let newLog = [...prev.log];
        let damageType = null; 
        
        if (prev.statusAilments.poison) {
           if (now % 2000 < 100) { 
              newPlayerHp -= Math.floor(prev.playerMaxHp * 0.05);
              if (!newLog.includes('毒によるダメージ！')) newLog.push('毒によるダメージ！');
           }
        }

        const newBuffs = { ...prev.buffs };
        Object.keys(newBuffs).forEach(key => {
           if (newBuffs[key] > 0) newBuffs[key] = Math.max(0, newBuffs[key] - delta);
        });

        if (newGauge >= currentEnemy.attackInterval) {
          newGauge = 0;
          
          const isDodge = Math.random() * 100 < eff.battle.evasionRate;

          if (isDodge) {
             newLog.push(`回避！ ${currentEnemy.name}の攻撃をかわした！`);
             damageType = 'DODGE';
          } else {
             const enemyAtk = Math.max(5, prev.stage * 8 + 5);
             const rawDmg = enemyAtk - (eff.battle.def * 0.5); 
             const damage = Math.max(1, Math.floor(rawDmg * (1 + Math.random() * 0.2)));
             
             newPlayerHp -= damage;
             newLog.push(`痛い！ ${currentEnemy.name}から${damage}のダメージ！`);
             damageType = 'DAMAGE';

             const typeData = MONSTER_TYPES[currentEnemy.type];
             if (typeData && typeData.actions) {
               if (typeData.actions.includes('POISON') && Math.random() < 0.3) {
                 prev.statusAilments.poison = true;
                 newLog.push('毒を受けてしまった！');
               }
               if (typeData.actions.includes('PARALYSIS') && Math.random() < 0.3) {
                 prev.statusAilments.paralysis = true;
                 newLog.push('麻痺してしまった！');
               }
             }
          }
        }

        const newEnemies = [...prev.enemies];
        newEnemies[prev.currentEnemyIndex] = {
          ...currentEnemy,
          currentAttackGauge: newGauge
        };

        return {
          ...prev,
          playerHp: newPlayerHp,
          enemies: newEnemies,
          buffs: newBuffs,
          log: newLog.length > 5 ? newLog.slice(-5) : newLog,
          lastTick: now,
          lastDamageType: damageType,
          lastDamageTime: damageType ? now : prev.lastDamageTime
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [setBattleState, battleState.isOver, eff.battle]); 

  useEffect(() => {
    if (battleState.lastDamageTime > 0 && battleState.lastDamageType) {
        setDamageAnim(battleState.lastDamageType);
        const timeout = setTimeout(() => setDamageAnim(null), 500);
        return () => clearTimeout(timeout);
    }
  }, [battleState.lastDamageTime, battleState.lastDamageType]);

  useEffect(() => {
    if (battleState.isOver) return; 
    if (battleState.playerHp <= 0) {
        setBattleState(prev => ({ ...prev, isOver: true }));
        setTimeout(() => onLose(), 100);
        return;
    }
    if (battleState.isBossDefeated) {
        setBattleState(prev => ({ ...prev, isOver: true }));
        setTimeout(() => onWin(battleState.stage), 500);
        return;
    }
  }, [battleState.playerHp, battleState.isBossDefeated, battleState.isOver, battleState.stage, onLose, onWin, setBattleState]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [battleState.currentEnemyIndex]);

  const handleUseItem = (item) => {
    const data = CONSUMABLES[item.consumableId];
    if (!data) return;

    let used = false;
    let msg = '';

    if (data.effect.type === 'HEAL') {
      if (battleState.playerHp >= eff.battle.maxHp) {
        setBattleState(prev => ({ ...prev, log: [...prev.log, 'HPは満タンです！'] }));
        return;
      }
      setBattleState(prev => ({ 
        ...prev, 
        playerHp: Math.min(eff.battle.maxHp, prev.playerHp + data.effect.value)
      }));
      used = true;
      msg = `HPが${data.effect.value}回復した！`;
    } else if (data.effect.type === 'CURE') {
      const ailment = data.effect.ailment.toLowerCase();
      if (!battleState.statusAilments[ailment]) {
        setBattleState(prev => ({ ...prev, log: [...prev.log, '効果がありません！'] }));
        return;
      }
      setBattleState(prev => ({
        ...prev,
        statusAilments: { ...prev.statusAilments, [ailment]: false }
      }));
      used = true;
      msg = `${data.name}を使用！`;
    } else if (data.effect.type === 'BUFF') {
      setBattleState(prev => ({
        ...prev,
        buffs: { ...prev.buffs, [data.effect.stat]: data.effect.duration }
      }));
      used = true;
      msg = `${data.name}を使用！力がみなぎる！`;
    }

    if (used) {
      setInventory(prev => {
        const idx = prev.findIndex(i => i.id === item.id);
        if (idx === -1) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      setBattleState(prev => ({ ...prev, log: [...prev.log, msg] }));
      if(inputRef.current) inputRef.current.focus();
    }
  };

  const handleInput = (e) => {
    if (battleState.isOver) return;
    
    if (battleState.statusAilments.paralysis && Math.random() < 0.3) {
       setBattleState(prev => ({ ...prev, log: [...prev.log, '麻痺して動けない！'] }));
       return;
    }

    const val = e.target.value;
    if (!/^[a-zA-Z0-9]*$/.test(val)) return;

    const num = parseInt(val.slice(-1));
    if (!isNaN(num) && num > 0) {
       const consumables = inventory.filter(i => i.type === 'CONSUMABLE');
       if (consumables[num - 1]) {
         handleUseItem(consumables[num - 1]);
         setTyped(prev => prev);
         return;
       }
    }

    if (/[0-9]/.test(val)) return;

    const targetRomaji = enemy.word.romaji;
    const currentLength = typed.length;

    if (val.length > currentLength) {
       const addedChar = val.slice(-1);
       const expectedChar = targetRomaji[currentLength];

       if (addedChar === expectedChar) {
          setTyped(val);
          if (val === targetRomaji) {
            setTyped('');
            attackEnemy();
          }
       } else {
          applyPenalty();
       }
    } else {
      if (val === targetRomaji.substring(0, val.length)) {
          setTyped(val);
      }
    }
  };

  const applyPenalty = () => {
     setAnimEffect('MISS');
     setTimeout(() => setAnimEffect(null), 300);
     setBattleState(prev => {
         const newEnemies = [...prev.enemies];
         const currentEnemy = newEnemies[prev.currentEnemyIndex];
         currentEnemy.currentAttackGauge = Math.min(currentEnemy.attackInterval, currentEnemy.currentAttackGauge + 500);
         return {
             ...prev,
             enemies: newEnemies,
             log: [...prev.log, 'ミス！ 敵の攻撃が早まった！']
         };
     });
  };

  const attackEnemy = () => {
    const isHit = Math.random() * 100 < eff.battle.hitRate;
    if (!isHit) {
        setAnimEffect('MISS_ATTACK');
        setTimeout(() => setAnimEffect(null), 500);
        setBattleState(prev => ({ ...prev, log: [...prev.log, '攻撃ミス！'] }));
        return;
    }
    const isCrit = Math.random() * 100 < eff.battle.critRate;
    const effectType = isCrit ? 'CRITICAL' : 'ATTACK';
    setAnimEffect(effectType);
    setTimeout(() => setAnimEffect(null), 300);

    let dmg = Math.floor(eff.battle.atk * (1 + Math.random() * 0.2));
    if (isCrit) dmg = Math.floor(dmg * 1.5);

    setBattleState(prev => {
        const newEnemies = [...prev.enemies];
        const currentEnemy = newEnemies[prev.currentEnemyIndex];
        currentEnemy.hp -= dmg;
        currentEnemy.currentAttackGauge = Math.max(0, currentEnemy.currentAttackGauge - 300); 
        const newLog = [...prev.log, `${enemy.name}に${dmg}のダメージ！${isCrit ? '(会心)' : ''}`];
        
        let nextIndex = prev.currentEnemyIndex;
        let isBossDefeated = false;

        if (currentEnemy.hp <= 0) {
            currentEnemy.hp = 0;
            newLog.push(`${enemy.name}を倒した！`);
            if (prev.currentEnemyIndex >= prev.enemies.length - 1) {
                isBossDefeated = true;
            } else {
                nextIndex = prev.currentEnemyIndex + 1;
            }
        }
        return {
            ...prev,
            enemies: newEnemies,
            currentEnemyIndex: nextIndex,
            log: newLog,
            lastTick: Date.now(),
            isBossDefeated: isBossDefeated
        };
    });
  };

  const keepFocus = () => { if(inputRef.current) inputRef.current.focus(); };
  const attackProgress = Math.min(100, (enemy.currentAttackGauge / enemy.attackInterval) * 100);
  const consumables = inventory.filter(i => i.type === 'CONSUMABLE');

  return (
    <div className="h-full bg-slate-900 text-white flex flex-col relative overflow-hidden" onClick={keepFocus}>
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px] animate-[slide-bg_20s_linear_infinite]"></div>
          <style>{`@keyframes slide-bg { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      <div className="relative z-10 p-4 flex justify-between items-start bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
          <div className="text-xl font-bold italic text-white flex items-center gap-2">
            <span className="bg-blue-600 w-8 h-8 rounded flex items-center justify-center text-sm">{battleState.stage}</span>
            STAGE {battleState.stage}
          </div>
          <div className="flex gap-4">
             {battleState.statusAilments.poison && <div className="bg-purple-900 px-3 py-1 rounded text-purple-200 animate-pulse font-bold flex items-center gap-1"><Skull size={14}/> 毒</div>}
             {battleState.statusAilments.paralysis && <div className="bg-yellow-900 px-3 py-1 rounded text-yellow-200 animate-pulse font-bold flex items-center gap-1"><Zap size={14}/> 麻痺</div>}
             {Object.entries(battleState.buffs).map(([key, val]) => val > 0 && (
                <div key={key} className="bg-orange-900 px-3 py-1 rounded text-orange-200 font-bold flex items-center gap-1"><ArrowRight size={14} className="-rotate-45"/> {key.toUpperCase()} UP</div>
             ))}
          </div>
      </div>

      <div className="flex-1 flex items-center justify-between px-10 relative z-10 max-w-6xl mx-auto w-full">
        <div className={`flex flex-col items-center transition-all duration-100 ${damageAnim === 'DAMAGE' ? 'translate-x-[-10px] text-red-500' : ''}`}>
            <div className="relative">
              <div className={`w-32 h-32 bg-blue-900/50 rounded-full border-4 border-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] overflow-hidden bg-slate-800 ${Object.values(battleState.buffs).some(v => v > 0) ? 'shadow-[0_0_40px_rgba(251,146,60,0.8)]' : ''}`}>
                <PlayerIll gender={player.gender} race={player.race} />
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 bg-gray-800 h-4 rounded-full border border-gray-600 overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${(battleState.playerHp / eff.battle.maxHp) * 100}%` }} />
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="font-bold text-lg">{player.name}</div>
              <div className="font-mono text-xl">{battleState.playerHp} / {eff.battle.maxHp}</div>
            </div>
            {damageAnim === 'DAMAGE' && <div className="absolute top-0 text-red-500 font-bold text-2xl animate-bounce">Hit!</div>}
            {damageAnim === 'DODGE' && <div className="absolute top-0 text-blue-300 font-bold text-2xl animate-pulse">Dodge!</div>}
        </div>

        <div className="text-4xl font-black text-slate-700 italic opacity-50">VS</div>

        <div className={`flex flex-col items-center transition-all duration-200 ${animEffect === 'ATTACK' || animEffect === 'CRITICAL' ? 'opacity-50 scale-95' : ''}`}>
            <div className="mb-2 w-48 flex items-center gap-2">
              <AlertTriangle size={16} className={attackProgress > 80 ? 'text-red-500 animate-pulse' : 'text-gray-600'} />
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-100 ${attackProgress > 80 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${attackProgress}%` }}></div>
              </div>
            </div>

            <div className="relative">
              <div className={`w-32 h-32 ${enemy.isBoss ? 'bg-red-900/50 border-red-500' : 'bg-purple-900/50 border-purple-500'} rounded-xl border-4 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all overflow-hidden bg-slate-800`}>
                <div className={`w-full h-full p-2 ${enemy.isBoss ? 'scale-125' : ''}`}>
                   <MonsterIll />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 bg-gray-800 h-4 rounded-full border border-gray-600 overflow-hidden">
                <div className="bg-red-500 h-full transition-all duration-200" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="font-bold text-lg">{enemy.name}</div>
              <div className="mt-4 bg-black/80 backdrop-blur px-6 py-3 rounded-xl border border-slate-500 min-w-[200px]">
                <div className="text-sm text-gray-400 mb-1">{enemy.word.display}</div>
                <div className="text-3xl font-mono font-bold tracking-widest">
                  <span className="text-blue-400">{typed}</span>
                  <span className="text-gray-600 opacity-50">{enemy.word.romaji.substring(typed.length)}</span>
                </div>
              </div>
            </div>
            {animEffect === 'ATTACK' && <div className="absolute top-10 left-10 text-6xl font-black text-yellow-300 italic animate-bounce pointer-events-none z-20">SLASH!</div>}
            {animEffect === 'CRITICAL' && <div className="absolute top-10 left-10 text-6xl font-black text-red-500 italic animate-bounce pointer-events-none z-20">CRITICAL!</div>}
            {animEffect === 'MISS_ATTACK' && <div className="absolute top-10 left-10 text-4xl font-black text-gray-500 italic animate-pulse pointer-events-none z-20">MISS...</div>}
            {animEffect === 'MISS' && <div className="absolute top-0 right-0 text-red-500 font-bold animate-ping">TYPE MISS!</div>}
        </div>
      </div>

      <input ref={inputRef} type="text" className="opacity-0 absolute top-0 left-0 w-full h-full cursor-default" value={typed} onChange={handleInput} autoFocus />

      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
         {consumables.slice(0, 9).map((item, i) => (
           <button 
             key={item.id} 
             onClick={(e) => { e.stopPropagation(); handleUseItem(item); }}
             className="w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded flex flex-col items-center justify-center hover:border-yellow-400 hover:scale-110 transition-all relative"
             title={CONSUMABLES[item.consumableId].desc}
           >
             <div className="scale-75">{CONSUMABLES[item.consumableId].icon}</div>
             <div className="absolute -top-2 -right-2 bg-slate-900 text-xs w-5 h-5 rounded-full flex items-center justify-center border border-slate-600">{i + 1}</div>
           </button>
         ))}
      </div>

      <div className="h-32 bg-slate-950 p-4 overflow-y-auto text-xs font-mono text-gray-400 border-t border-slate-800 z-10">
        {battleState.log.map((l, i) => <div key={i} className="border-b border-slate-900 py-1">{l}</div>)}
        <div ref={(el) => el && el.scrollIntoView({ behavior: 'smooth' })}></div>
      </div>
    </div>
  );
};

const ResultModal = ({ message, onClose, onTown }) => {
  if (!message) return null;
  const { type, title, gold, item, levelUpInfo } = message;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`p-8 rounded-2xl border-2 max-w-md w-full text-center shadow-2xl ${type === 'WIN' ? 'bg-slate-800 border-yellow-500' : 'bg-slate-900 border-red-900'}`}>
        <div className={`mb-4 flex justify-center ${type === 'WIN' ? 'text-yellow-400' : 'text-red-500'}`}>
            {type === 'WIN' ? <Trophy size={48} /> : <Skull size={48} />}
        </div>
        <h2 className="text-3xl font-black text-white mb-6 tracking-wider">{title}</h2>
        
        {type === 'WIN' && (
          <div className="space-y-4 mb-8">
            {levelUpInfo && (
               <div className="bg-green-900/50 text-green-300 py-3 px-4 rounded font-bold animate-pulse text-left">
                  <div className="text-center text-xl mb-2">LEVEL UP! {levelUpInfo.oldLv} → {levelUpInfo.newLv}</div>
                  <div className="grid grid-cols-2 gap-x-4 text-sm font-mono">
                     {Object.entries(levelUpInfo.gains).map(([key, val]) => (
                        val > 0 && <div key={key} className="flex justify-between">
                           <span>{key.toUpperCase()}</span> 
                           <span>+{val}</span>
                        </div>
                     ))}
                  </div>
               </div>
            )}
            <div className="flex justify-between items-center bg-slate-900 p-3 rounded">
              <span className="text-gray-400">獲得ゴールド</span>
              <span className="text-yellow-400 font-bold flex items-center gap-1">+{gold} <Coins size={14}/></span>
            </div>
            <div className="bg-slate-900 p-4 rounded border border-slate-700 text-left">
              <div className="text-xs text-gray-500 mb-2 text-center">獲得アイテム</div>
              <div className={`text-xl font-bold ${item.type === 'CONSUMABLE' ? 'text-green-400' : RARITY[item.rarity.toUpperCase()].color} mb-2 text-center`}>{item.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  {item.type === 'CONSUMABLE' ? (
                    <div className="col-span-2 text-center">消耗品</div>
                  ) : (
                    <>
                      {(item.stats?.atk || 0) > 0 && <span>ATK:{item.stats.atk}</span>}
                      {(item.stats?.def || 0) > 0 && <span>DEF:{item.stats.def}</span>}
                      <span>WT:{item.stats?.wt || 0}</span>
                    </>
                  )}
              </div>
            </div>
          </div>
        )}

        {type === 'LOSE' && (
          <div className="mb-8 text-gray-400">
              <p>HPが尽きてしまった...</p>
              <p className="text-sm mt-2">装備を見直して再挑戦しよう！</p>
          </div>
        )}

        <button onClick={onTown} className={`w-full py-3 text-white rounded font-bold ${type === 'WIN' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
          町へ戻る
        </button>
      </div>
    </div>
  );
};

export default function TypingGame() {
  const [gameState, setGameState] = useState('INIT');
  const [player, setPlayer] = useState(null);
  const [battleState, setBattleState] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({ HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null });
  const [modalMessage, setModalMessage] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [difficulty, setDifficulty] = useState('EASY');
  
  // Firebase Auth State
  const [fbUser, setFbUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const initAuth = async () => {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }
  };

  useEffect(() => {
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
    });
    return () => unsubscribe();
  }, []);

  // データロード (ユーザー変更時)
  useEffect(() => {
    const loadData = async () => {
      if (fbUser && !isGuest) {
        // Firestoreからロード
        try {
          // パス: /artifacts/{appId}/users/{uid}/saveData/current
          // ここではドキュメントを直接指定
          const docRef = doc(db, 'artifacts', appId, 'users', fbUser.uid, 'saveData', 'current');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPlayer(data.player);
            setInventory(data.inventory || []);
            setEquipped(data.equipped || { HEAD: null, BODY: null, FEET: null, ACCESSORY: null, WEAPON: null });
            setGameState('TITLE');
          } else {
             // データなし -> キャラ作成へ
             setGameState('TITLE');
          }
        } catch (e) {
          console.error("Load Error:", e);
          setGameState('TITLE');
        }
      } else if (isGuest) {
        // ゲストはメモリ上のみなのでリロードで消える (前回のlocalStorageを見るロジックは削除)
        // 新規開始状態
        setGameState('TITLE');
      }
    };
    if (gameState === 'INIT' && (fbUser || isGuest)) {
      loadData();
    }
  }, [fbUser, isGuest]);

  // データセーブ (状態変化時)
  useEffect(() => {
    if (player && fbUser && !isGuest) {
      const saveData = async () => {
        try {
          const data = { player, inventory, equipped };
          const docRef = doc(db, 'artifacts', appId, 'users', fbUser.uid, 'saveData', 'current');
          await setDoc(docRef, data);
        } catch (e) {
          console.error("Save Error:", e);
        }
      };
      saveData();
    }
    // ゲストは保存しない
  }, [player, inventory, equipped, fbUser, isGuest]);

  const refreshShop = useCallback((currentShop = []) => {
     if(!player) return;
     const newItems = [];
     newItems.push(generateConsumable());
     newItems.push(generateConsumable());
     for(let i=0; i<3; i++) {
        newItems.push(generateItem(player.level));
     }
     setShopItems(newItems);
  }, [player]);

  useEffect(() => {
     if(gameState === 'TOWN' && shopItems.length === 0 && player) {
         refreshShop();
     }
  }, [gameState, player, shopItems.length, refreshShop]);

  const handleCreateChar = (formData) => {
    const initialStats = calcInitialStats(formData.job, formData.race, formData.personality);
    const newPlayer = {
      name: formData.name, job: formData.job, race: formData.race, gender: formData.gender, personality: formData.personality,
      level: 1, exp: 0, gold: 500, maxStage: 1, stats: initialStats
    };
    const initialWeapon = generateItem(1, formData.job);
    initialWeapon.type = 'WEAPON';
    initialWeapon.name = '初心者の' + (JOBS[formData.job].weapon);
    
    const initialPotions = [
      generateConsumable(), generateConsumable(), generateConsumable()
    ].map(p => ({ ...p, consumableId: 'POTION_S', name: 'ポーション' }));

    setPlayer(newPlayer);
    setInventory([initialWeapon, ...initialPotions]);
    setEquipped(prev => ({ ...prev, WEAPON: initialWeapon }));
    setGameState('TOWN');
  };
  
  // 転職処理
  const handleChangeClass = (newJobId, cost) => {
    if (!player) return;
    const newGold = player.gold - cost;
    const currentWeapon = equipped.WEAPON;
    const newEquipped = { ...equipped, WEAPON: null };
    const newInventory = [...inventory];
    if (currentWeapon) newInventory.push(currentWeapon);

    let newStats = calcInitialStats(newJobId, player.race, player.personality);
    const levelsToGrow = player.level - 1;
    if (levelsToGrow > 0) {
      const growthResult = growStats(newStats, newJobId, levelsToGrow);
      newStats = growthResult.newStats;
    }

    const newPlayer = { ...player, job: newJobId, gold: newGold, stats: newStats };
    setPlayer(newPlayer);
    setInventory(newInventory);
    setEquipped(newEquipped);
    setGameState('TOWN');
    alert(`${JOBS[newJobId].name} に転職しました！\nステータスが再計算されました。`);
  };

  const startBattle = (stage) => {
    const eff = calculateEffectiveStats(player, equipped);
    const wordList = WORD_LISTS[difficulty];
    const enemies = [];
    const normalTypes = ['SLIME', 'BAT', 'GOBLIN', 'WOLF', 'SKELETON'];
    const bossTypes = ['DRAGON', 'DEMON'];

    for (let i = 0; i < 9; i++) {
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const typeKey = normalTypes[Math.floor(Math.random() * normalTypes.length)];
      const typeData = MONSTER_TYPES[typeKey];
      const baseHp = eff.battle.atk * 0.8 * typeData.hpMod; 
      const enemyHp = Math.floor(baseHp * (1 + stage * 0.2));
      enemies.push({
        id: generateId(),
        name: `${typeData.name} Lv.${stage}`,
        type: typeKey,
        hp: Math.max(1, enemyHp),
        maxHp: Math.max(1, enemyHp),
        word: word,
        isBoss: false,
        attackInterval: Math.max(2000, 6000 - (stage * 200)), 
        currentAttackGauge: 0
      });
    }
    
    const bossWord = difficulty === 'EASY' 
      ? { display: 'ぼす', romaji: 'bosu' }
      : { display: 'ボスモンスター', romaji: 'bosumonsuta' };
    const bossTypeKey = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    const bossData = MONSTER_TYPES[bossTypeKey];
    const bossHp = Math.floor(eff.battle.atk * 4 * (1 + stage * 0.3));

    enemies.push({
      id: generateId(),
      name: `BOSS: ${bossData.name} Lv.${stage}`,
      type: bossTypeKey,
      hp: bossHp,
      maxHp: bossHp,
      word: bossWord,
      isBoss: true,
      attackInterval: Math.max(1500, 4000 - (stage * 150)),
      currentAttackGauge: 0
    });

    setBattleState({
      stage: stage,
      enemies: enemies,
      currentEnemyIndex: 0,
      playerHp: eff.battle.maxHp, 
      playerMaxHp: eff.battle.maxHp,
      log: ['戦闘開始！'],
      isOver: false,
      lastTick: Date.now(),
      isBossDefeated: false,
      lastDamageType: null,
      lastDamageTime: 0,
      statusAilments: { poison: false, paralysis: false },
      buffs: { str: 0, vit: 0, agi: 0, dex: 0 }
    });
    setGameState('BATTLE');
  };

  const handleEquip = (item) => {
    const slot = item.type === 'WEAPON' ? 'WEAPON' : item.type;
    setEquipped(prev => ({ ...prev, [slot]: item }));
  };

  const handleUnequip = (slot) => {
    setEquipped(prev => ({ ...prev, [slot]: null }));
  };

  const handleWin = (stage) => {
    const gold = stage * 100 + Math.floor(Math.random() * 50);
    const item = generateItem(player.level, player.job);
    let newPlayer = { ...player };
    newPlayer.gold += gold;
    newPlayer.exp += stage * 50;
    
    const reqExp = newPlayer.level * 100;
    let levelUpInfo = null;
    if (newPlayer.exp >= reqExp) {
      const oldLv = newPlayer.level;
      newPlayer.level += 1;
      newPlayer.exp = newPlayer.exp - reqExp;
      
      const growthResult = growStats(newPlayer.stats, newPlayer.job, 1);
      newPlayer.stats = growthResult.newStats;
      levelUpInfo = { oldLv, newLv: newPlayer.level, gains: growthResult.gains };
    }
    if (stage === newPlayer.maxStage) {
      newPlayer.maxStage += 1;
    }
    refreshShop();
    setPlayer(newPlayer);
    setInventory(prev => [...prev, item]);
    setModalMessage({
      type: 'WIN',
      title: 'STAGE CLEAR!',
      gold,
      item,
      levelUpInfo
    });
    setGameState('RESULT');
  };

  const handleLose = () => {
    setModalMessage({
      type: 'LOSE',
      title: 'GAME OVER...',
    });
    setGameState('RESULT');
  };

  const handleLogout = async () => {
     await signOut(auth);
     setPlayer(null);
     setIsGuest(false);
     setGameState('INIT');
     setShowAuth(false);
  };

  // 認証成功時
  const handleAuthSuccess = () => {
     setIsGuest(false);
     setShowAuth(false);
     setGameState('TITLE'); // データロードはuseEffectがトリガー
  };

  const handleGuestStart = () => {
     setIsGuest(true);
     setPlayer(null); // クリア
     setShowAuth(false);
     setGameState('TITLE'); 
     // ゲストなら即座に初期データなしとして扱われるため、キャラ作成へ行くはず
  };

  if (showAuth) {
    return (
      <AuthScreen 
         onLogin={handleAuthSuccess} 
         onGuest={handleGuestStart}
         onBack={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden font-sans select-none relative">
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>
      
      {gameState === 'TITLE' && 
        <TitleScreen 
          player={player} 
          onStartNew={() => setShowAuth(true)} 
          onResume={() => setGameState('TOWN')} 
          onDelete={() => { 
             if(window.confirm('本当にデータを削除しますか？')) { 
                if (isGuest) {
                   setPlayer(null);
                   setInventory([]);
                   setEquipped({});
                } else {
                   // Firestore delete logic would go here
                   // For now just clear local state which triggers save
                   setPlayer(null); 
                }
             }
          }} 
          difficulty={difficulty} 
          setDifficulty={setDifficulty}
          onShowAuth={() => setShowAuth(true)}
        />
      }
      {gameState === 'CHAR_CREATE' && <CharCreateScreen onCreate={handleCreateChar} />}
      {gameState === 'TOWN' && player && <TownScreen player={player} inventory={inventory} equipped={equipped} onEquip={handleEquip} onUnequip={handleUnequip} onStartBattle={startBattle} onLogout={handleLogout} onOpenShop={() => setGameState('SHOP')} onClassChange={() => setGameState('CLASS_CHANGE')} difficulty={difficulty} />}
      {gameState === 'SHOP' && player && <ShopScreen player={player} inventory={inventory} equipped={equipped} setPlayer={setPlayer} setInventory={setInventory} onBack={() => setGameState('TOWN')} shopItems={shopItems} onRefreshShop={setShopItems} />}
      {gameState === 'CLASS_CHANGE' && player && <ClassChangeScreen player={player} onChangeClass={handleChangeClass} onBack={() => setGameState('TOWN')} />}
      {gameState === 'BATTLE' && battleState && player && <BattleScreen battleState={battleState} setBattleState={setBattleState} player={player} equipped={equipped} inventory={inventory} setInventory={setInventory} onWin={handleWin} onLose={handleLose} difficulty={difficulty} />}
      {gameState === 'RESULT' && <ResultModal message={modalMessage} onTown={() => { setModalMessage(null); setGameState('TOWN'); }} />}
    </div>
  );
}