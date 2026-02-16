import React from 'react';
// ★修正: Ring を削除し、Gem を追加しました
import { Sword, Shield, Footprints, HardHat, FlaskConical, Scroll, Gem } from 'lucide-react';

const ItemIcon = ({ item, size = 24, className = "" }) => {
  if (!item) return <div style={{ width: size, height: size }} className={`bg-slate-700 rounded ${className}`} />;

  // 画像ID（imageId）が設定されている場合は画像を表示
  if (item.imageId) {
    return (
      <img 
        src={`/items/${item.imageId}`} 
        alt={item.name}
        style={{ width: size, height: size, imageRendering: 'pixelated' }}
        className={`object-contain ${className}`}
      />
    );
  }

  const iconProps = { size, className };

  // 消耗品の場合
  if (item.consumableId) {
    if (item.consumableId.includes('POTION')) return <FlaskConical {...iconProps} className={`${className} text-red-400`} />;
    if (item.consumableId.includes('SCROLL')) return <Scroll {...iconProps} className={`${className} text-yellow-400`} />;
    // その他消耗品 (青い宝石)
    return <Gem {...iconProps} className={`${className} text-blue-400`} />;
  }

  // 装備品の場合
  switch (item.type) {
    case 'WEAPON': return <Sword {...iconProps} className={`${className} text-slate-300`} />;
    case 'BODY': return <Shield {...iconProps} className={`${className} text-slate-300`} />;
    case 'HEAD': return <HardHat {...iconProps} className={`${className} text-slate-300`} />;
    case 'FEET': return <Footprints {...iconProps} className={`${className} text-slate-300`} />;
    // ★修正: Ring の代わりに Gem (黄色い宝石) を使用
    case 'ACCESSORY': return <Gem {...iconProps} className={`${className} text-yellow-500`} />;
    default: return <div style={{ width: size, height: size }} className={`bg-slate-700 rounded ${className}`} />;
  }
};

export default ItemIcon;