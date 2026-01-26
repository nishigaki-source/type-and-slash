import React from 'react';
import { 
  Sword, Shield, Footprints, Crown, Shirt, Gem, 
  FlaskConical, Wand2, Hand, Target, CircleHelp 
} from 'lucide-react';

export const ItemIcon = ({ item, size = 16, className = "" }) => {
  if (!item) return <CircleHelp size={size} className={`text-slate-300 ${className}`} />;
  
  if (item.type === 'CONSUMABLE') return <FlaskConical size={size} className={className} />;
  
  if (item.type === 'HEAD') return <Crown size={size} className={className} />;
  if (item.type === 'BODY') return <Shirt size={size} className={className} />;
  if (item.type === 'FEET') return <Footprints size={size} className={className} />;
  if (item.type === 'ACCESSORY') return <Gem size={size} className={className} />;
  
  if (item.type === 'WEAPON') {
    if (item.name.includes('剣')) return <Sword size={size} className={className} />;
    if (item.name.includes('杖')) return <Wand2 size={size} className={className} />;
    if (item.name.includes('爪') || item.name.includes('ナックル')) return <Hand size={size} className={className} />;
    if (item.name.includes('弓')) return <Target size={size} className={className} />;
    if (item.name.includes('盾')) return <Shield size={size} className={className} />;
    return <Sword size={size} className={className} />;
  }
  
  return <CircleHelp size={size} className={className} />;
};