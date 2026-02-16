// src/constants/monsters.js
// 起動時にスプレッドシートから読み込まれたデータがここに格納されます
export let MONSTER_DATA = {};

export const setMonsterData = (data) => {
  MONSTER_DATA = data;
};