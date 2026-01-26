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
  ],
  HARD: [
    { display: 'Code', romaji: 'code' }, { display: 'React', romaji: 'react' },
    { display: 'Vite', romaji: 'vite' }, { display: 'Component', romaji: 'component' },
    { display: 'Props', romaji: 'props' }, { display: 'State', romaji: 'state' },
    { display: 'Hook', romaji: 'hook' }, { display: 'Effect', romaji: 'effect' },
    { display: 'Render', romaji: 'render' }, { display: 'Mount', romaji: 'mount' },
    { display: 'Import', romaji: 'import' }, { display: 'Export', romaji: 'export' },
    { display: 'Default', romaji: 'default' }, { display: 'Const', romaji: 'const' },
    { display: 'Function', romaji: 'function' }, { display: 'Return', romaji: 'return' },
    { display: 'Async', romaji: 'async' }, { display: 'Await', romaji: 'await' },
    { display: 'Promise', romaji: 'promise' }, { display: 'Console', romaji: 'console' },
    { display: 'Log', romaji: 'log' }, { display: 'Error', romaji: 'error' },
    { display: 'Warning', romaji: 'warning' }, { display: 'Info', romaji: 'info' },
    { display: 'Debug', romaji: 'debug' }, { display: 'Table', romaji: 'table' },
    { display: 'Map', romaji: 'map' }, { display: 'Filter', romaji: 'filter' },
    { display: 'Reduce', romaji: 'reduce' }, { display: 'Find', romaji: 'find' },
    { display: 'Some', romaji: 'some' }, { display: 'Every', romaji: 'every' },
    { display: 'Includes', romaji: 'includes' }, { display: 'IndexOf', romaji: 'indexof' },
    { display: 'Slice', romaji: 'slice' }, { display: 'Splice', romaji: 'splice' },
    { display: 'Push', romaji: 'push' }, { display: 'Pop', romaji: 'pop' },
    { display: 'Shift', romaji: 'shift' }, { display: 'Unshift', romaji: 'unshift' },
    { display: 'Join', romaji: 'join' }, { display: 'Split', romaji: 'split' },
    { display: 'Replace', romaji: 'replace' }, { display: 'Match', romaji: 'match' },
    { display: 'Search', romaji: 'search' }, { display: 'Test', romaji: 'test' },
    { display: 'Exec', romaji: 'exec' }, { display: 'ToLowerCase', romaji: 'tolowercase' },
    { display: 'ToUpperCase', romaji: 'touppercase' }, { display: 'Trim', romaji: 'trim' },
    { display: 'Length', romaji: 'length' }, { display: 'Typeof', romaji: 'typeof' },
    { display: 'Instanceof', romaji: 'instanceof' }, { display: 'New', romaji: 'new' },
    { display: 'Class', romaji: 'class' }, { display: 'Extends', romaji: 'extends' },
    { display: 'Super', romaji: 'super' }, { display: 'This', romaji: 'this' },
    { display: 'Constructor', romaji: 'constructor' }, { display: 'Static', romaji: 'static' },
    { display: 'Get', romaji: 'get' }, { display: 'Set', romaji: 'set' },
    { display: 'Try', romaji: 'try' }, { display: 'Catch', romaji: 'catch' },
    { display: 'Finally', romaji: 'finally' }, { display: 'Throw', romaji: 'throw' },
    { display: 'If', romaji: 'if' }, { display: 'Else', romaji: 'else' },
    { display: 'Switch', romaji: 'switch' }, { display: 'Case', romaji: 'case' },
    { display: 'Break', romaji: 'break' }, { display: 'Default', romaji: 'default' },
    { display: 'For', romaji: 'for' }, { display: 'While', romaji: 'while' },
    { display: 'Do', romaji: 'do' }, { display: 'Continue', romaji: 'continue' },
    { display: 'Var', romaji: 'var' }, { display: 'Let', romaji: 'let' },
    { display: 'True', romaji: 'true' }, { display: 'False', romaji: 'false' },
    { display: 'Null', romaji: 'null' }, { display: 'Undefined', romaji: 'undefined' },
    { display: 'NaN', romaji: 'nan' }, { display: 'Infinity', romaji: 'infinity' },
    { display: 'Object', romaji: 'object' }, { display: 'Array', romaji: 'array' },
    { display: 'String', romaji: 'string' }, { display: 'Number', romaji: 'number' },
    { display: 'Boolean', romaji: 'boolean' }, { display: 'Symbol', romaji: 'symbol' },
    { display: 'BigInt', romaji: 'bigint' }, { display: 'Date', romaji: 'date' },
    { display: 'Math', romaji: 'math' }, { display: 'JSON', romaji: 'json' },
    { display: 'RegExp', romaji: 'regexp' }, { display: 'Error', romaji: 'error' },
    { display: 'Window', romaji: 'window' }, { display: 'Document', romaji: 'document' },
    { display: 'Navigator', romaji: 'navigator' }, { display: 'Location', romaji: 'location' },
    { display: 'History', romaji: 'history' }, { display: 'Screen', romaji: 'screen' },
    { display: 'LocalStorage', romaji: 'localstorage' }, { display: 'SessionStorage', romaji: 'sessionstorage' },
    { display: 'Cookie', romaji: 'cookie' }, { display: 'Fetch', romaji: 'fetch' },
    { display: 'XHR', romaji: 'xhr' }, { display: 'AJAX', romaji: 'ajax' },
    { display: 'DOM', romaji: 'dom' }, { display: 'API', romaji: 'api' },
    { display: 'SDK', romaji: 'sdk' }, { display: 'URL', romaji: 'url' },
    { display: 'URI', romaji: 'uri' }, { display: 'HTTP', romaji: 'http' },
    { display: 'HTTPS', romaji: 'https' }, { display: 'HTML', romaji: 'html' },
    { display: 'CSS', romaji: 'css' }, { display: 'JS', romaji: 'js' },
    { display: 'XML', romaji: 'xml' }, { display: 'SVG', romaji: 'svg' },
    { display: 'Canvas', romaji: 'canvas' }, { display: 'WebGL', romaji: 'webgl' },
    { display: 'npm', romaji: 'npm' }, { display: 'yarn', romaji: 'yarn' },
    { display: 'node', romaji: 'node' }, { display: 'git', romaji: 'git' },
    { display: 'docker', romaji: 'docker' }, { display: 'aws', romaji: 'aws' },
    { display: 'gcp', romaji: 'gcp' }, { display: 'azure', romaji: 'azure' },
    { display: 'firebase', romaji: 'firebase' }, { display: 'vercel', romaji: 'vercel' },
    { display: 'netlify', romaji: 'netlify' }, { display: 'heroku', romaji: 'heroku' },
    { display: 'linux', romaji: 'linux' }, { display: 'mac', romaji: 'mac' },
    { display: 'windows', romaji: 'windows' }, { display: 'android', romaji: 'android' },
    { display: 'ios', romaji: 'ios' }, { display: 'chrome', romaji: 'chrome' },
    { display: 'firefox', romaji: 'firefox' }, { display: 'safari', romaji: 'safari' },
    { display: 'edge', romaji: 'edge' }, { display: 'opera', romaji: 'opera' },
    { display: 'ie', romaji: 'ie' },
    { display: '<div>', romaji: '<div>' }, { display: '</div>', romaji: '</div>' },
    { display: '<br/>', romaji: '<br/>' }, { display: 'console.log()', romaji: 'console.log()' },
    { display: '=>', romaji: '=>' }, { display: '{}', romaji: '{}' },
    { display: '[]', romaji: '[]' }, { display: '()', romaji: '()' },
    { display: '#id', romaji: '#id' }, { display: '.class', romaji: '.class' },
    { display: '1+1=2', romaji: '1+1=2' }, { display: '100%', romaji: '100%' },
    { display: '$100', romaji: '$100' }, { display: '@user', romaji: '@user' },
    { display: 'http://', romaji: 'http://' }, { display: 'www.', romaji: 'www.' },
    { display: '.com', romaji: '.com' }, { display: '.org', romaji: '.org' },
    { display: '.net', romaji: '.net' }, { display: '.io', romaji: '.io' },
  ]
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