import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { QuestCard } from '../components/QuestCard';
import { Card } from '../components/Card';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ProfileSelector } from '../components/ProfileSelector';
import { playTapSound, playFanfareSound } from '../lib/sounds';
import { Users, Shuffle, Sparkles } from 'lucide-react';

// Monthly level system constants
const MAX_LEVEL = 50;
const POINTS_FOR_MAX = 4800; // 80% of theoretical max (6000pt)
const POINTS_PER_LEVEL = Math.floor(POINTS_FOR_MAX / (MAX_LEVEL - 1)); // ~100pt per level

// Helper: Get current month's start timestamp
const getMonthStart = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

export const KidPage = () => {
    const { t, i18n } = useTranslation();
    const isJa = i18n.language === 'ja';

    // Get all state from store unconditionally (React hooks rules)
    const profiles = useStore((state) => state.profiles);
    const activeProfileId = useStore((state) => state.activeProfileId);
    const legacyPoints = useStore((state) => state.currentPoints);
    const legacyHistory = useStore((state) => state.history);

    // Subscribe to daily quest state changes
    const dailyQuestStates = useStore((state) => state.dailyQuestStates);
    const getDailyQuests = useStore((state) => state.getDailyQuests);
    const resetDailyQuests = useStore((state) => state.resetDailyQuests);
    const getRemainingResets = useStore((state) => state.getRemainingResets);

    // Memoize the quests list to ensure it updates when dailyQuestStates changes
    const displayQuests = useMemo(() => getDailyQuests(), [getDailyQuests, dailyQuestStates]);

    // Profile-aware state
    const activeProfile = profiles.find(p => p.id === activeProfileId);
    const currentPoints = activeProfile?.currentPoints ?? legacyPoints;
    const history = activeProfile?.history ?? legacyHistory;

    const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);

    // Calculate monthly points (for level calculation)
    const monthlyPoints = useMemo(() => {
        const monthStart = getMonthStart();
        return history
            .filter(item => {
                const itemDate = new Date(item.date);
                return item.type === 'quest' && itemDate >= monthStart;
            })
            .reduce((sum, item) => sum + item.pointDiff, 0);
    }, [history]);

    // Level calculation: Based on monthly points, resets each month
    const rawLevel = Math.floor(monthlyPoints / POINTS_PER_LEVEL) + 1;
    const level = Math.min(rawLevel, MAX_LEVEL);
    const pointsInCurrentLevel = monthlyPoints % POINTS_PER_LEVEL;
    const progressPercent = level >= MAX_LEVEL ? 100 : (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;

    // Level titles (every 5 levels)
    const getLevelTitle = (lv: number): string => {
        if (lv >= 50) return t('level.level50');
        if (lv >= 45) return t('level.level45');
        if (lv >= 40) return t('level.level40');
        if (lv >= 35) return t('level.level35');
        if (lv >= 30) return t('level.level30');
        if (lv >= 25) return t('level.level25');
        if (lv >= 20) return t('level.level20');
        if (lv >= 15) return t('level.level15');
        if (lv >= 10) return t('level.level10');
        if (lv >= 5) return t('level.level5');
        return t('level.level1');
    };

    // Hero Image based on level (every 5 levels)
    const getHeroImage = (lv: number): string => {
        if (lv >= 50) return '/hero_lv50.png';
        if (lv >= 45) return '/hero_lv45.png';
        if (lv >= 40) return '/hero_lv40.png';
        if (lv >= 35) return '/hero_lv35.png';
        if (lv >= 30) return '/hero_lv30.png';
        if (lv >= 25) return '/hero_lv25.png';
        if (lv >= 20) return '/hero_lv20.png';
        if (lv >= 15) return '/hero_lv15.png';
        if (lv >= 10) return '/hero_lv10.png';
        if (lv >= 5) return '/hero_lv5.png';
        return '/hero_lv1.png';
    };

    // Evolution Logic
    const [showEvolutionModal, setShowEvolutionModal] = useState(false);
    const prevLevelRef = useRef(level);

    useEffect(() => {
        // Check if hero image changed (evolution) - only if level increased
        if (level > prevLevelRef.current) {
            const prevImage = getHeroImage(prevLevelRef.current);
            const currImage = getHeroImage(level);

            if (prevImage !== currImage) {
                // Evolution happened!
                setTimeout(() => {
                    playFanfareSound();
                    setShowEvolutionModal(true);
                }, 500); // Slight delay for effect
            }
        }
        prevLevelRef.current = level;
    }, [level]);

    // Calculate levels until next evolution
    // Next milestone is next multiple of 5
    const nextEvolutionLevel = Math.floor(level / 5) * 5 + 5;
    const levelsToEvolution = nextEvolutionLevel - level;

    // Get current month name
    const currentMonthName = new Date().toLocaleDateString(isJa ? 'ja-JP' : 'en-US', { month: 'long' });

    return (
        <div className="min-h-screen bg-blue-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b-2 border-blue-100 p-4 shadow-sm">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Profile Switcher */}
                        {profiles.length > 0 && (
                            <button
                                onClick={() => setIsProfileSelectorOpen(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                            >
                                <span className="text-xl">{activeProfile?.icon || '🦸'}</span>
                                <span className="font-bold text-sm max-w-[60px] truncate">
                                    {activeProfile?.name || 'ゆうしゃ'}
                                </span>
                                {profiles.length > 1 && <Users size={14} />}
                            </button>
                        )}
                        <div className="bg-yellow-400 p-2 rounded-xl text-2xl shadow-inner border-2 border-yellow-500">
                            🪙
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">{t('common.currentPoints')}</p>
                            <div className="text-3xl font-black text-slate-800 tracking-tight">
                                {currentPoints.toLocaleString()}
                                <span className="text-sm ml-1 text-slate-500 font-bold">{t('common.points')}</span>
                            </div>
                        </div>
                    </div>

                    <LanguageSwitcher />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* Progress / Level with Hero */}
                <Card variant="colorful" className="p-6 relative overflow-visible mt-8">
                    {/* Monthly Reset Badge */}
                    <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                        📅 {currentMonthName}
                    </div>

                    <div className="flex flex-col items-center text-center relative z-0">
                        {/* Animated Hero Image */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            whileTap={{ scale: 0.9, rotate: -5 }}
                            className="w-48 h-48 -mt-10 mb-2 relative z-10"
                        >
                            <div className="w-full h-full rounded-full bg-indigo-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 to-purple-100/50" />
                                <img
                                    src={getHeroImage(level)}
                                    onError={(e) => {
                                        e.currentTarget.src = '/hero_lv1.png';
                                    }}
                                    alt="Hero"
                                    className="w-full h-full object-cover transform scale-110"
                                />
                                {/* Glossy effect */}
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />
                            </div>
                        </motion.div>

                        <div className="w-full">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-block bg-white/30 backdrop-blur-sm px-4 py-1 rounded-full text-blue-800 font-black text-sm mb-1"
                            >
                                {getLevelTitle(level)}
                            </motion.div>

                            <h2 className="text-3xl font-black text-blue-900 mb-4 drop-shadow-sm">
                                {t('level.title', { level })}
                            </h2>

                            <div className="relative w-full h-6 bg-slate-200/50 rounded-full overflow-hidden border-2 border-white shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                                {/* Percentage Text */}
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                                    {Math.round(progressPercent)}%
                                </div>
                            </div>

                            {/* Evolution Teaser */}
                            {level < 50 && (
                                <div className="mt-4 bg-indigo-50/80 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 border-2 border-indigo-100 shadow-sm">
                                    <Sparkles size={18} className="text-indigo-500 animate-pulse" />
                                    <span className="text-indigo-600 font-bold text-sm">
                                        {isJa
                                            ? `つぎの しんか まで あと ${levelsToEvolution} レベル！`
                                            : `${levelsToEvolution} levels until evolution!`}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between text-xs mt-3 font-bold">
                                <span className="text-blue-600 bg-white/50 px-2 py-1 rounded-lg">
                                    {level < MAX_LEVEL
                                        ? t('kid.nextLevel', { points: POINTS_PER_LEVEL - pointsInCurrentLevel })
                                        : (isJa ? '🎉 さいこうレベル！' : '🎉 Max Level!')
                                    }
                                </span>
                                <span className="text-slate-500 bg-white/50 px-2 py-1 rounded-lg">
                                    {isJa ? `今月: ${monthlyPoints}pt` : `This month: ${monthlyPoints}pt`}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Quest Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <span>🛡️</span> {t('kid.todayQuests')}
                        </h2>
                        {getRemainingResets() > 0 ? (
                            <button
                                onClick={() => {
                                    playTapSound();
                                    resetDailyQuests();
                                }}
                                className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                            >
                                <Shuffle size={16} />
                                <span>{isJa ? 'シャッフル' : 'Shuffle'}</span>
                                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                                    {getRemainingResets()}
                                </span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-1 bg-slate-200 text-slate-400 px-3 py-2 rounded-xl text-sm font-bold">
                                <Shuffle size={16} />
                                <span>{isJa ? '完了' : 'Done'}</span>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {displayQuests.map((quest) => (
                            <QuestCard key={quest.id} quest={quest} />
                        ))}
                    </div>
                </div>
            </main>

            {/* Profile Selector Modal */}
            <ProfileSelector
                isOpen={isProfileSelectorOpen}
                onClose={() => setIsProfileSelectorOpen(false)}
            />

            {/* Evolution Celebration Modal */}
            <AnimatePresence>
                {showEvolutionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowEvolutionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.5, y: 50 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Background Effects */}
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-white to-blue-100 opacity-50" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,yellow_20deg,transparent_40deg)] opacity-20"
                            />

                            <div className="relative z-10">
                                <motion.h2
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                    className="text-3xl font-black text-orange-500 mb-6 drop-shadow-sm"
                                >
                                    {isJa ? 'しんか したよ！' : 'EVOLUTION!'}
                                </motion.h2>

                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="w-48 h-48 mx-auto mb-6 rounded-full bg-white border-4 border-yellow-300 shadow-2xl overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50" />
                                    <img
                                        src={getHeroImage(level)}
                                        alt="Evolution"
                                        className="w-full h-full object-cover relative z-10"
                                    />
                                    {/* Glossy effect */}
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none z-20" />
                                </motion.div>

                                <p className="text-xl font-bold text-slate-700 mb-2">
                                    {getLevelTitle(level)}
                                </p>
                                <p className="text-sm font-bold text-slate-400 mb-8">
                                    {isJa ? 'もっと つよく なったね！' : 'You became stronger!'}
                                </p>

                                <button
                                    onClick={() => setShowEvolutionModal(false)}
                                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    {isJa ? 'やったー！' : 'Yay!'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
