import { Flame, Zap, Gift, Crown, Coins, Calendar, Gem, Medal, Award } from 'lucide-react';

// Backend sends an icon NAME (string); the glyph itself lives here.
export const ICONS = { flame: Flame, zap: Zap, gift: Gift, crown: Crown, coins: Coins, calendar: Calendar, gem: Gem, medal: Medal };
export const iconFor = (name) => ICONS[name] || Award;
