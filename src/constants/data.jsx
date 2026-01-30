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

// 難易度・ゾーン定義
export const DIFFICULTY_SETTINGS = {
  EASY: {
    target: "初心者・低学年",
    zones: [
      {
        id: 1, name: "はじまりの洞窟", range: [1, 20],
        features: "基礎・指慣らし (1〜2文字)",
        zako: [ // 1-2文字、母音・清音
          { display: 'あ', romaji: 'a' }, { display: 'い', romaji: 'i' }, { display: 'う', romaji: 'u' }, 
          { display: 'え', romaji: 'e' }, { display: 'お', romaji: 'o' }, { display: 'か', romaji: 'ka' },
          { display: 'き', romaji: 'ki' }, { display: 'く', romaji: 'ku' }, { display: 'け', romaji: 'ke' },
          { display: 'こ', romaji: 'ko' }, { display: 'さ', romaji: 'sa' }, { display: 'し', romaji: 'shi' },
          { display: 'た', romaji: 'ta' }, { display: 'ち', romaji: 'chi' }, { display: 'な', romaji: 'na' },
          { display: 'うし', romaji: 'ushi' }, { display: 'かめ', romaji: 'kame' }, { display: 'さる', romaji: 'saru' },
          { display: 'くま', romaji: 'kuma' }, { display: 'とり', romaji: 'tori' }, { display: 'はな', romaji: 'hana' }
        ],
        boss: [ // 3文字 簡単な単語
          { display: 'あお', romaji: 'ao' }, { display: 'かき', romaji: 'kaki' }, { display: 'すし', romaji: 'sushi' },
          { display: 'あか', romaji: 'aka' }, { display: 'くつ', romaji: 'kutsu' }, { display: 'みみ', romaji: 'mimi' },
          { display: 'ゆめ', romaji: 'yume' }, { display: 'そら', romaji: 'sora' }, { display: 'うみ', romaji: 'umi' }
        ]
      },
      {
        id: 2, name: "迷いの森", range: [21, 40],
        features: "拗音・濁音・少し長い単語",
        zako: [ // 3-4文字 濁音・半濁音・撥音
          { display: 'りんご', romaji: 'ringo' }, { display: 'めがね', romaji: 'megane' }, { display: 'みかん', romaji: 'mikan' },
          { display: 'ごはん', romaji: 'gohan' }, { display: 'ぱんだ', romaji: 'panda' }, { display: 'ぎんこう', romaji: 'ginkou' },
          { display: 'えんぴつ', romaji: 'enpitsu' }, { display: 'てんぷら', romaji: 'tenpura' },
          { display: 'がらす', romaji: 'garasu' }, { display: 'じしょ', romaji: 'jisho' }, { display: 'でんわ', 'romaji': 'denwa' }
        ],
        boss: [ // 5文字
          { display: 'ぱいなっぷる', romaji: 'painappuru' }, { display: 'さんぐらす', romaji: 'sangurasu' },
          { display: 'はんばーぐ', romaji: 'hanbaagu' }, { display: 'ぷれぜんと', romaji: 'purezento' },
          { display: 'おにぎり', romaji: 'onigiri' }, { display: 'ひまわり', romaji: 'himawari' }
        ]
      },
      {
        id: 3, name: "試練の砂漠", range: [41, 60],
        features: "拗音・促音を含む単語",
        zako: [ // 4-6文字 拗音・促音
          { display: 'きっさてん', romaji: 'kissaten' }, { display: 'ちきゅう', romaji: 'chikyuu' },
          { display: 'がっこう', romaji: 'gakkou' }, { display: 'びょういん', romaji: 'byouin' },
          { display: 'きっぷ', romaji: 'kippu' }, { display: 'ちょこれーと', romaji: 'chokoreito' },
          { display: 'しゃしん', romaji: 'shashin' }, { display: 'しゅくだい', romaji: 'shukudai' }
        ],
        boss: [ // 7文字以上 拗音含む
          { display: 'ちゅうしゃじょう', romaji: 'chuushajou' }, { display: 'しょうぼうしゃ', romaji: 'shoubousha' },
          { display: 'きゅうきゅうしゃ', romaji: 'kyuukyuusha' }, { display: 'びじゅつかん', romaji: 'bijutsukan' },
          { display: 'ゆうえんち', romaji: 'yuuenchi' }, { display: 'どうぶつえん', romaji: 'doubutsuen' }
        ]
      },
      {
        id: 4, name: "灼熱の火山", range: [61, 80],
        features: "短文・文章・スピード勝負",
        zako: [ // 短文（句読点なし）
          { display: 'おはようございます', romaji: 'ohayougozaimasu' }, { display: 'こんにちは', romaji: 'konnichiwa' },
          { display: 'おやすみなさい', romaji: 'oyasuminasai' }, { display: 'いただきます', romaji: 'itadakimasu' },
          { display: 'ごちそうさまでした', romaji: 'gochisousamadeshita' }, { display: 'ありがとう', romaji: 'arigatou' },
          { display: 'さようなら', romaji: 'sayounara' }, { display: 'はじめまして', romaji: 'hajimemashite' }
        ],
        boss: [ // 2文節（スペースあり）
          { display: 'あしたは　はれです', romaji: 'ashitaha haredesu' },
          { display: 'きょうは　あめです', romaji: 'kyouha amedesu' },
          { display: 'いっしょに　あそぼう', romaji: 'isshoni asobou' },
          { display: 'ごはんを　たべる', romaji: 'gohanwo taberu' }, { display: 'ほんを　よむ', romaji: 'honwo yomu' }
        ]
      },
      {
        id: 5, name: "奈落の最深部", range: [81, 100],
        features: "長文・難読・複雑な文章",
        zako: [ // 長めの文章
          { display: 'むかしむかしあるところに', romaji: 'mukashimukashiarutokoroni' },
          { display: 'あるひもりのなかで', romaji: 'aruhimorinonakade' },
          { display: 'くまさんに出会いました', romaji: 'kumasannideaimashita' },
          { display: 'おじいさんとおばあさんが', romaji: 'ojiisantoobaasanga' }
        ],
        boss: [ // 超長文
          { display: 'おじいさんはやまへしばかりに', romaji: 'ojiisanhayamaheshibakarini' },
          { display: 'おばあさんはかわへせんたくに', romaji: 'obaasanhakawahesentakuni' },
          { display: 'いつまでもいつまでもしあわせに', romaji: 'itsumademoitsumademoshiawaseni' },
          { display: 'めでたしめでたし', romaji: 'medetashimedetashi' }
        ]
      }
    ]
  },
  NORMAL: {
    target: "中高学年〜大人",
    zones: [
      {
        id: 1, name: "はじまりの洞窟", range: [1, 20],
        features: "生活単語・名詞・複合名詞",
        zako: [ // 生活単語・名詞
          { display: '学校', romaji: 'gakkou' }, { display: '野菜', romaji: 'yasai' }, { display: '冒険', romaji: 'bouken' },
          { display: '携帯', romaji: 'keitai' }, { display: '時計', romaji: 'tokei' }, { display: '電車', romaji: 'densha' },
          { display: '電話', romaji: 'denwa' }, { display: '眼鏡', romaji: 'megane' }, { display: '帽子', romaji: 'boushi' }
        ],
        boss: [ // 複合名詞
          { display: '電気自動車', romaji: 'denkijidousha' }, { display: '夏休み', romaji: 'natsuyasumi' },
          { display: '修学旅行', romaji: 'shuugakuryokou' }, { display: '宇宙飛行士', romaji: 'uchuuhikoushi' },
          { display: '消防自動車', romaji: 'shouboujidousha' }, { display: '郵便局', romaji: 'yuubinkyoku' }
        ]
      },
      {
        id: 2, name: "迷いの森", range: [21, 40],
        features: "熟語・ことわざ・慣用句",
        zako: [ // 二字・四字熟語
          { display: '平和', romaji: 'heiwa' }, { display: '一石二鳥', romaji: 'issekinichou' },
          { display: '自由', romaji: 'jiyuu' }, { display: '一期一会', romaji: 'ichigoichie' },
          { display: '科学', romaji: 'kagaku' }, { display: '東奔西走', romaji: 'touhonseisou' },
          { display: '油断大敵', romaji: 'yudantaiteki' }, { display: '四面楚歌', romaji: 'shimensoka' }
        ],
        boss: [ // ことわざ・慣用句
          { display: '猿も木から落ちる', romaji: 'sarumokikaraochiru' },
          { display: '犬も歩けば棒に当たる', romaji: 'inumoarukebabouniataru' },
          { display: '鬼に金棒', romaji: 'oninikanabou' }, { display: '花より団子', romaji: 'hanayoridango' },
          { display: '早起きは三文の徳', romaji: 'hayaokihasanmonnotoku' }
        ]
      },
      {
        id: 3, name: "試練の砂漠", range: [41, 60],
        features: "理科・社会用語・長い名称",
        zako: [ // 理科・社会用語
          { display: '織田信長', romaji: 'odanobunaga' }, { display: '光合成', romaji: 'kougousei' },
          { display: '徳川家康', romaji: 'tokugawaieyasu' }, { display: '二酸化炭素', romaji: 'nisankatanso' },
          { display: '北海道', romaji: 'hokkaidou' }, { display: '顕微鏡', romaji: 'kenbikyou' },
          { display: '豊臣秀吉', romaji: 'toyotomihideyoshi' }, { display: '酸素', romaji: 'sanso' }
        ],
        boss: [ // 長い名称
          { display: '聖徳太子', romaji: 'shoutokutaishi' }, { display: 'オーストラリア', romaji: 'oosutoraria' },
          { display: 'フランシスコ・ザビエル', romaji: 'furanshisukozabieru' },
          { display: '中華人民共和国', romaji: 'chuukajinminkyouwakoku' },
          { display: 'アメリカ合衆国', romaji: 'amerikagasshuukoku' }
        ]
      },
      {
        id: 4, name: "灼熱の火山", range: [61, 80],
        features: "日常会話・ビジネス・敬語",
        zako: [ // 日常・ビジネス
          { display: 'ありがとうございます', romaji: 'arigatougozaimasu' },
          { display: 'よろしくお願いします', romaji: 'yoroshikuonegaishimasu' },
          { display: '申し訳ございません', romaji: 'moushiwakegozaimasen' },
          { display: '承知いたしました', romaji: 'shouchiitashimashita' },
          { display: 'お疲れ様です', romaji: 'otsukaresamadesu' }, { display: '失礼いたします', romaji: 'shitsureiitashimasu' }
        ],
        boss: [ // メール件名・挨拶
          { display: 'お世話になっております', romaji: 'osewaninatteorimasu' },
          { display: 'ご確認をお願いいたします', romaji: 'gokakuninoonegaiitashimasu' },
          { display: 'お問い合わせについて', romaji: 'otoiawasenitsuite' },
          { display: '会議のお知らせ', romaji: 'kaiginooshirase' }
        ]
      },
      {
        id: 5, name: "奈落の最深部", range: [81, 100],
        features: "論説・ニュース・小説",
        zako: [ // ニュース・小説
          { display: '我輩は猫である', romaji: 'wagahaihanekodearu' },
          { display: '国境の長いトンネルを抜けると', romaji: 'kokkyounonagaitonneruwnukeruto' },
          { display: '情けは人の為ならず', romaji: 'nasakehahitonotamenarazu' },
          { display: '春はあけぼの', romaji: 'haruhaakebono' }
        ],
        boss: [ // 論説・激ムズ
          { display: '内閣府は経済統計を発表した', romaji: 'naikakuhuhakeizaitoukeiwwohappyouashita' },
          { display: '祇園精舎の鐘の声', romaji: 'gionshoujanokanenokoe' },
          { display: '諸行無常の響きあり', romaji: 'shogyoumujounohibikiari' },
          { display: '為替相場は円安ドル高', romaji: 'kawasesoubahaenyasudorudaka' }
        ]
      }
    ]
  },
  HARD: {
    target: "プログラマ・高学年",
    zones: [
      {
        id: 1, name: "はじまりの洞窟", range: [1, 20],
        features: "英単語 (3〜5文字)",
        zako: [ // 3-5文字
          { display: 'cat', romaji: 'cat' }, { display: 'book', romaji: 'book' }, { display: 'play', romaji: 'play' },
          { display: 'dog', romaji: 'dog' }, { display: 'blue', romaji: 'blue' }, { display: 'jump', romaji: 'jump' },
          { display: 'run', romaji: 'run' }, { display: 'eat', romaji: 'eat' }, { display: 'see', romaji: 'see' },
          { display: 'red', romaji: 'red' }, { display: 'one', romaji: 'one' }, { display: 'cup', romaji: 'cup' }
        ],
        boss: [ // 8文字以上
          { display: 'beautiful', romaji: 'beautiful' }, { display: 'elephant', romaji: 'elephant' },
          { display: 'computer', romaji: 'computer' }, { display: 'yesterday', romaji: 'yesterday' },
          { display: 'tomorrow', romaji: 'tomorrow' }, { display: 'important', romaji: 'important' }
        ]
      },
      {
        id: 2, name: "迷いの森", range: [21, 40],
        features: "頭文字大文字・All Caps",
        zako: [ // 頭文字大文字
          { display: 'Sunday', romaji: 'Sunday' }, { display: 'Japan', romaji: 'Japan' }, { display: 'Tom', romaji: 'Tom' },
          { display: 'Monday', romaji: 'Monday' }, { display: 'Tokyo', romaji: 'Tokyo' }, { display: 'London', romaji: 'London' },
          { display: 'Paris', romaji: 'Paris' }, { display: 'China', romaji: 'China' }, { display: 'India', romaji: 'India' }
        ],
        boss: [ // All Caps
          { display: 'WARNING', romaji: 'WARNING' }, { display: 'DANGER', romaji: 'DANGER' },
          { display: 'CAUTION', romaji: 'CAUTION' }, { display: 'GAME OVER', romaji: 'GAMEOVER' },
          { display: 'SUCCESS', romaji: 'SUCCESS' }, { display: 'ERROR', romaji: 'ERROR' }
        ]
      },
      {
        id: 3, name: "試練の砂漠", range: [41, 60],
        features: "英単語＋数字・日付・式",
        zako: [ // 英単語＋数字
          { display: 'Room 101', romaji: 'Room101' }, { display: 'iPhone 15', romaji: 'iPhone15' },
          { display: 'Level 99', romaji: 'Level99' }, { display: 'No.1', romaji: 'No.1' },
          { display: 'Part 2', romaji: 'Part2' }, { display: 'Area 51', romaji: 'Area51' }, { display: 'R2-D2', romaji: 'R2-D2' }
        ],
        boss: [ // 日付・式
          { display: '2024/01/01', romaji: '2024/01/01' }, { display: '10+5=15', romaji: '10+5=15' },
          { display: '3.14159', romaji: '3.14159' }, { display: 'E=mc^2', romaji: 'E=mc^2' },
          { display: '1+1=2', romaji: '1+1=2' }, { display: '1999-12-31', romaji: '1999-12-31' }
        ]
      },
      {
        id: 4, name: "灼熱の火山", range: [61, 80],
        features: "記号・アドレス・パスワード",
        zako: [ // アドレス・パス
          { display: 'user@email.com', romaji: 'user@email.com' }, { display: 'https://', romaji: 'https://' },
          { display: '#hashtag', romaji: '#hashtag' }, { display: '123_456', romaji: '123_456' },
          { display: 'login.php', romaji: 'login.php' }, { display: 'index.html', romaji: 'index.html' }
        ],
        boss: [ // 複雑なパス
          { display: 'P@ssw0rd_123!', romaji: 'P@ssw0rd_123!' },
          { display: 'S3cur1ty#Key', romaji: 'S3cur1ty#Key' },
          { display: 'AbC$123%Def', romaji: 'AbC$123%Def' }, { display: 'Z_345=678', romaji: 'Z_345=678' }
        ]
      },
      {
        id: 5, name: "奈落の最深部", range: [81, 100],
        features: "プログラミングコード・構文",
        zako: [ // 構文
          { display: '<div></div>', romaji: '<div></div>' }, { display: 'print("Hi")', romaji: 'print("Hi")' },
          { display: 'const x = 0;', romaji: 'constx=0;' }, { display: 'return true;', romaji: 'returntrue;' },
          { display: 'import React', romaji: 'importReact' }, { display: 'export default', romaji: 'exportdefault' }
        ],
        boss: [ // 長いコード
          { display: 'if(hp <= 0){ GameOver(); }', romaji: 'if(hp<=0){GameOver();}' },
          { display: 'console.log("Hello World");', romaji: 'console.log("HelloWorld");' },
          { display: 'import React from "react";', romaji: 'importReactfrom"react";' },
          { display: 'const [s, set] = useState(0);', romaji: 'const[s,set]=useState(0);' }
        ]
      }
    ]
  }
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