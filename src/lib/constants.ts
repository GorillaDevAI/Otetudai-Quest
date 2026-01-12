// ========================================
// Game Constants
// ========================================

// Level System
export const MAX_LEVEL = 50;
export const POINTS_FOR_MAX = 4800; // 80% of theoretical max (6000pt)
export const POINTS_PER_LEVEL = Math.floor(POINTS_FOR_MAX / (MAX_LEVEL - 1)); // ~100pt per level

// Daily Quest System
export const DAILY_QUEST_COUNT = 4; // Number of random quests to show daily
export const MAX_RESETS_PER_DAY = 2; // Max times user can shuffle quests

// Profile System
export const MAX_PROFILES = 5;
export const AVATAR_EMOJIS = ['🦸', '🧙', '🧚', '🦊', '🐻'];

// Level Milestone Thresholds (for hero images and titles)
export const LEVEL_MILESTONES = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;
