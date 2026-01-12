import { MAX_LEVEL, POINTS_PER_LEVEL } from './constants';
import type { TFunction } from 'i18next';

/**
 * Calculate level from monthly points
 */
export const calculateLevel = (monthlyPoints: number): number => {
    const rawLevel = Math.floor(monthlyPoints / POINTS_PER_LEVEL) + 1;
    return Math.min(rawLevel, MAX_LEVEL);
};

/**
 * Calculate progress percentage within current level
 */
export const calculateProgress = (monthlyPoints: number): number => {
    const level = calculateLevel(monthlyPoints);
    if (level >= MAX_LEVEL) return 100;
    const pointsInCurrentLevel = monthlyPoints % POINTS_PER_LEVEL;
    return (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;
};

/**
 * Get points needed for next level
 */
export const getPointsToNextLevel = (monthlyPoints: number): number => {
    const level = calculateLevel(monthlyPoints);
    if (level >= MAX_LEVEL) return 0;
    const pointsInCurrentLevel = monthlyPoints % POINTS_PER_LEVEL;
    return POINTS_PER_LEVEL - pointsInCurrentLevel;
};

/**
 * Get hero image path based on level
 * Hero images change every 5 levels
 */
export const getHeroImage = (level: number): string => {
    if (level >= 50) return '/hero_lv50.png';
    if (level >= 45) return '/hero_lv45.png';
    if (level >= 40) return '/hero_lv40.png';
    if (level >= 35) return '/hero_lv35.png';
    if (level >= 30) return '/hero_lv30.png';
    if (level >= 25) return '/hero_lv25.png';
    if (level >= 20) return '/hero_lv20.png';
    if (level >= 15) return '/hero_lv15.png';
    if (level >= 10) return '/hero_lv10.png';
    if (level >= 5) return '/hero_lv5.png';
    return '/hero_lv1.png';
};

/**
 * Get level title (localized)
 */
export const getLevelTitle = (level: number, t: TFunction): string => {
    if (level >= 50) return t('level.level50');
    if (level >= 45) return t('level.level45');
    if (level >= 40) return t('level.level40');
    if (level >= 35) return t('level.level35');
    if (level >= 30) return t('level.level30');
    if (level >= 25) return t('level.level25');
    if (level >= 20) return t('level.level20');
    if (level >= 15) return t('level.level15');
    if (level >= 10) return t('level.level10');
    if (level >= 5) return t('level.level5');
    return t('level.level1');
};

/**
 * Get levels until next evolution (hero image change)
 * Evolution happens every 5 levels
 */
export const getLevelsToEvolution = (level: number): number => {
    if (level >= MAX_LEVEL) return 0;
    const nextMilestone = Math.floor(level / 5) * 5 + 5;
    return nextMilestone - level;
};

/**
 * Get start of current month
 */
export const getMonthStart = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};
