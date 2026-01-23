// src/components/GameSvgs.jsx
import React from 'react';

export const getSkinColor = (race) => {
  switch (race) {
    case 'ELF': return '#fecaca';
    case 'DEMON': return '#c4b5fd';
    case 'DWARF': return '#fdba74';
    default: return '#fca5a5';
  }
};

const FemaleEyes = () => (
  <g>
    <path d="M40,43 Q43,40 46,43" stroke="#334155" strokeWidth="1.5" fill="none" />
    <path d="M54,43 Q57,40 60,43" stroke="#334155" strokeWidth="1.5" fill="none" />
    <circle cx="43" cy="44" r="2.5" fill="#1e293b" />
    <circle cx="57" cy="44" r="2.5" fill="#1e293b" />
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

export const SVGs = {
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
        {isFemale && <path d="M25,40 Q10,70 30,90 Q60,95 85,80 Q90,50 65,35" fill="#fbbf24" />}
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
  Slime: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl animate-bounce-slow"><path d="M20,80 Q50,90 80,80 Q90,60 80,40 Q50,10 20,40 Q10,60 20,80 Z" fill="#3b82f6" opacity="0.8" /><ellipse cx="35" cy="45" rx="5" ry="7" fill="white" /><circle cx="37" cy="45" r="2" fill="black" /><ellipse cx="65" cy="45" rx="5" ry="7" fill="white" /><circle cx="63" cy="45" r="2" fill="black" /><path d="M45,60 Q50,65 55,60" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/></svg>),
  Bat: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl"><path d="M30,50 Q10,30 10,60 Q20,70 30,60 L50,70 L70,60 Q80,70 90,60 Q90,30 70,50 L50,40 Z" fill="#475569" /><circle cx="40" cy="55" r="3" fill="#facc15" /><circle cx="60" cy="55" r="3" fill="#facc15" /><path d="M48,65 L50,70 L52,65" fill="white" /></svg>),
  Goblin: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl"><rect x="40" y="60" width="20" height="30" fill="#57534e" /><circle cx="50" cy="45" r="25" fill="#4ade80" /><path d="M25,45 L10,35 L28,38 Z" fill="#4ade80" /><path d="M75,45 L90,35 L72,38 Z" fill="#4ade80" /><circle cx="40" cy="40" r="4" fill="#fef08a" /><circle cx="60" cy="40" r="4" fill="#fef08a" /><circle cx="40" cy="40" r="1" fill="black" /><circle cx="60" cy="40" r="1" fill="black" /><path d="M40,55 Q50,60 60,55" fill="none" stroke="black" strokeWidth="2" /><path d="M42,55 L44,58 L46,55" fill="white" /><path d="M54,55 L56,58 L58,55" fill="white" /><path d="M70,60 L90,20 Q95,15 85,25 L75,55 Z" fill="#78350f" /></svg>),
  Wolf: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl"><path d="M20,60 Q30,40 50,40 Q70,40 80,60 Q90,70 80,80 Q50,90 20,80 Q10,70 20,60 Z" fill="#94a3b8" /><path d="M30,45 L20,20 L40,40 Z" fill="#94a3b8" /><path d="M70,45 L80,20 L60,40 Z" fill="#94a3b8" /><circle cx="40" cy="60" r="3" fill="#ef4444" /><circle cx="60" cy="60" r="3" fill="#ef4444" /><path d="M45,75 L50,80 L55,75" fill="black" /></svg>),
  Skeleton: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl"><rect x="42" y="60" width="16" height="30" fill="#e2e8f0" /><circle cx="50" cy="40" r="22" fill="#f8fafc" /><circle cx="42" cy="38" r="5" fill="#1e293b" /><circle cx="58" cy="38" r="5" fill="#1e293b" /><path d="M45,50 L55,50" stroke="#1e293b" strokeWidth="2" /><line x1="48" y1="48" x2="48" y2="52" stroke="#1e293b" strokeWidth="1" /><line x1="52" y1="48" x2="52" y2="52" stroke="#1e293b" strokeWidth="1" /></svg>),
  Dragon: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl"><path d="M10,40 Q30,10 50,40" fill="#dc2626" opacity="0.8"/><path d="M90,40 Q70,10 50,40" fill="#dc2626" opacity="0.8"/><path d="M30,80 Q50,100 70,80 L70,40 Q50,20 30,40 Z" fill="#b91c1c" /><path d="M30,40 L40,20 L50,40" fill="#ef4444" /><path d="M30,45 Q50,30 70,45 L60,70 Q50,80 40,70 Z" fill="#b91c1c" /><circle cx="40" cy="50" r="4" fill="#fbbf24" /><circle cx="60" cy="50" r="4" fill="#fbbf24" /><path d="M45,65 Q50,70 55,65" fill="none" stroke="black" strokeWidth="2" /><path d="M35,35 L20,20" stroke="#fef08a" strokeWidth="3" /><path d="M65,35 L80,20" stroke="#fef08a" strokeWidth="3" /></svg>),
  Demon: () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl"><path d="M20,90 Q50,110 80,90 L75,40 Q50,30 25,40 Z" fill="#4c1d95" /><path d="M20,40 Q10,60 10,90" stroke="#1e1b4b" strokeWidth="5" fill="none"/><path d="M80,40 Q90,60 90,90" stroke="#1e1b4b" strokeWidth="5" fill="none"/><circle cx="50" cy="40" r="25" fill="#5b21b6" /><path d="M30,25 L20,10" stroke="#facc15" strokeWidth="4" /><path d="M70,25 L80,10" stroke="#facc15" strokeWidth="4" /><path d="M35,40 L45,45 L35,50 Z" fill="#ef4444" /><path d="M65,40 L55,45 L65,50 Z" fill="#ef4444" /><path d="M45,60 L42,65 L48,60" fill="white" /><path d="M55,60 L58,65 L52,60" fill="white" /></svg>)
};