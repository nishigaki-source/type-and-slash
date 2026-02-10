// src/constants/monsters.js (新規作成)
export const MONSTER_DATA = {
  SLIME: {
    name: 'スライム',
    imageId: 'slime.png', // public/monsters/slime.png を想定
    hpMod: 0.8,
    minFloor: 1,
    maxFloor: 30,
    words: [
      { display: 'あめ', romaji: 'ame' },
      { display: 'ぷよぷよ', romaji: 'puyopuyo' },
      { display: 'ゼリー', romaji: 'zerii' }
    ]
  },
  GOBLIN: {
    name: 'ゴブリン',
    imageId: 'goblin.png',
    hpMod: 1.0,
    minFloor: 10,
    maxFloor: 50,
    words: [
      { display: 'いたずら', romaji: 'itazura' },
      { display: 'こんぼう', romaji: 'konbou' }
    ],
    actions: ['POISON']
  },
  DRAGON: {
    name: 'ドラゴン',
    imageId: 'dragon.png',
    hpMod: 3.5,
    minFloor: 40,
    maxFloor: 100,
    words: [
      { display: 'ほのおのブレス', romaji: 'honoonoburesu' },
      { display: 'ひりゅう', romaji: 'hiryuu' }
    ],
    isBossOnly: true // ボス枠でのみ出現させる設定例
  }
};