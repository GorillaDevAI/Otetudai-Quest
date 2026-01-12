import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type AppState, type Quest, type Reward, type ChildProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initial default data with bilingual support
const DEFAULT_QUESTS: Quest[] = [
    { id: 'q1', title: 'おさらあらい', titleEn: 'Wash Dishes', point: 50, icon: '🍽️', oncePerDay: false },
    { id: 'q2', title: 'おふろそうじ', titleEn: 'Clean Bathroom', point: 100, icon: '🛁', oncePerDay: false },
    { id: 'q3', title: 'くつそろえ', titleEn: 'Organize Shoes', point: 10, icon: '👟', oncePerDay: false },
    { id: 'q4', title: 'せんたくたたみ', titleEn: 'Fold Laundry', point: 30, icon: '👕', oncePerDay: false },
    { id: 'q5', title: 'しゅくだい', titleEn: 'Homework', point: 80, icon: '📚', oncePerDay: true, mustShow: true },
    { id: 'q6', title: 'あしたのじゅんび', titleEn: 'Prepare for Tomorrow', point: 50, icon: '🎒', oncePerDay: true },
    { id: 'q7', title: 'じかんわりあわせ', titleEn: 'Check Schedule', point: 30, icon: '📅', oncePerDay: true },
    { id: 'q8', title: 'れんらくちょうをみせる', titleEn: 'Show Contact Book', point: 20, icon: '📓', oncePerDay: true },
];

const DEFAULT_REWARDS: Reward[] = [
    { id: 'r1', title: 'Youtube 30ぷん', titleEn: 'YouTube 30min', cost: 300, icon: '📺' },
    { id: 'r2', title: 'おやつ 1つ', titleEn: 'One Snack', cost: 150, icon: '🍭' },
    { id: 'r3', title: 'ゲーム 1じかん', titleEn: 'Gaming 1hr', cost: 500, icon: '🎮' },
];

const AVATAR_EMOJIS = ['🦸', '🧙', '🧚', '🦊', '🐻'];

// Create a default profile
const createDefaultProfile = (name: string = 'ゆうしゃ', icon: string = '🦸'): ChildProfile => ({
    id: uuidv4(),
    name,
    icon,
    currentPoints: 0,
    totalPointsEarned: 0,
    history: [],
    createdAt: new Date().toISOString(),
});

// Helper: check if date is today (local time)
const isToday = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
};

// Helper: get today's date string (YYYY-MM-DD)
const getTodayStr = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Constants for daily quest system
const DAILY_QUEST_COUNT = 4; // Number of random quests to show
const MAX_RESETS_PER_DAY = 2;

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Multi-profile support
            profiles: [],
            activeProfileId: null,

            // Global settings
            quests: DEFAULT_QUESTS,
            rewards: DEFAULT_REWARDS,

            // Daily quest states per profile
            dailyQuestStates: {},

            // Legacy fields (for backward compatibility)
            currentPoints: 0,
            totalPointsEarned: 0,
            history: [],

            isFirstLaunch: true,

            completeOnboarding: () => {
                const state = get();
                // If no profiles exist, create a default one
                if (state.profiles.length === 0) {
                    const defaultProfile = createDefaultProfile();
                    set({
                        isFirstLaunch: false,
                        profiles: [defaultProfile],
                        activeProfileId: defaultProfile.id,
                    });
                } else {
                    set({ isFirstLaunch: false });
                }
            },

            // Profile Management
            addProfile: (name, icon) => {
                const state = get();
                // Check if this is the first profile and we have legacy data
                const isFirstProfile = state.profiles.length === 0;
                const hasLegacyData = state.currentPoints > 0 || state.history.length > 0;

                let newProfile = createDefaultProfile(name, icon);

                if (isFirstProfile && hasLegacyData) {
                    // Migrate legacy data to the first profile
                    newProfile = {
                        ...newProfile,
                        currentPoints: state.currentPoints,
                        totalPointsEarned: state.totalPointsEarned,
                        history: state.history.map(h => ({ ...h, profileId: newProfile.id })),
                    };
                }

                if (state.profiles.length >= 5) return;

                const newProfiles = [...state.profiles, newProfile];

                set({
                    profiles: newProfiles,
                    activeProfileId: state.activeProfileId || newProfile.id,
                });
            },

            updateProfile: (id, name, icon) => {
                set((state) => ({
                    profiles: state.profiles.map((p) =>
                        p.id === id ? { ...p, name, icon } : p
                    ),
                }));
            },

            deleteProfile: (id) => {
                const state = get();
                const newProfiles = state.profiles.filter((p) => p.id !== id);
                let newActiveId = state.activeProfileId;

                // If deleted profile was active, switch to first remaining
                if (state.activeProfileId === id) {
                    newActiveId = newProfiles.length > 0 ? newProfiles[0].id : null;
                }

                set({
                    profiles: newProfiles,
                    activeProfileId: newActiveId,
                });
            },

            setActiveProfile: (id) => {
                set({ activeProfileId: id });
            },

            getActiveProfile: () => {
                const state = get();
                return state.profiles.find((p) => p.id === state.activeProfileId) || null;
            },

            // Point Actions (profile-aware)
            addPoints: (amount, type, itemId, itemTitle) => {
                const state = get();
                const activeId = state.activeProfileId;

                const historyItem = {
                    id: uuidv4(),
                    date: new Date().toISOString(),
                    type,
                    itemId,
                    itemTitle,
                    pointDiff: amount,
                    profileId: activeId || undefined,
                };

                if (activeId) {
                    // Multi-profile mode
                    set({
                        profiles: state.profiles.map((p) =>
                            p.id === activeId
                                ? {
                                    ...p,
                                    currentPoints: p.currentPoints + amount,
                                    totalPointsEarned: p.totalPointsEarned + amount,
                                    history: [historyItem, ...p.history],
                                }
                                : p
                        ),
                    });
                } else {
                    // Legacy single-profile mode
                    set({
                        currentPoints: state.currentPoints + amount,
                        totalPointsEarned: state.totalPointsEarned + amount,
                        history: [historyItem, ...state.history],
                    });
                }
            },

            removePoints: (amount, type, itemId, itemTitle) => {
                const state = get();
                const activeId = state.activeProfileId;

                const historyItem = {
                    id: uuidv4(),
                    date: new Date().toISOString(),
                    type,
                    itemId,
                    itemTitle,
                    pointDiff: -amount,
                    profileId: activeId || undefined,
                };

                if (activeId) {
                    set({
                        profiles: state.profiles.map((p) =>
                            p.id === activeId
                                ? {
                                    ...p,
                                    currentPoints: Math.max(0, p.currentPoints - amount),
                                    history: [historyItem, ...p.history],
                                }
                                : p
                        ),
                    });
                } else {
                    set({
                        currentPoints: Math.max(0, state.currentPoints - amount),
                        history: [historyItem, ...state.history],
                    });
                }
            },

            // Quest Actions
            addQuest: (quest) => set((state) => ({ quests: [...state.quests, quest] })),

            updateQuest: (updatedQuest) =>
                set((state) => ({
                    quests: state.quests.map((q) => (q.id === updatedQuest.id ? updatedQuest : q)),
                })),

            deleteQuest: (id) =>
                set((state) => ({ quests: state.quests.filter((q) => q.id !== id) })),

            isQuestCompletedToday: (questId: string) => {
                const state = get();
                const activeProfile = state.profiles.find((p) => p.id === state.activeProfileId);
                const history = activeProfile?.history || state.history;

                return history.some(
                    (item) =>
                        item.itemId === questId &&
                        item.type === 'quest' &&
                        isToday(item.date)
                );
            },

            // Daily Quest Selection
            getDailyQuests: () => {
                const state = get();
                const profileId = state.activeProfileId || 'default';
                const todayStr = getTodayStr();
                let dailyState = state.dailyQuestStates[profileId];

                // Get quests completed today by this profile
                const activeProfile = state.profiles.find(p => p.id === state.activeProfileId);
                const history = activeProfile?.history || state.history;
                const completedTodayIds = history
                    .filter(item => item.type === 'quest' && isToday(item.date))
                    .map(item => item.itemId);

                // Must-show quests (always displayed)
                const mustShowQuests = state.quests.filter(q => q.mustShow);
                const mustShowIds = mustShowQuests.map(q => q.id);

                // Optional quests (not must-show)
                const optionalQuests = state.quests.filter(q => !q.mustShow);

                // Initialize or reset if new day
                if (!dailyState || dailyState.date !== todayStr) {
                    // Pick random optional quests
                    const shuffled = [...optionalQuests].sort(() => Math.random() - 0.5);
                    const selectedOptional = shuffled.slice(0, DAILY_QUEST_COUNT);
                    const selectedIds = [...mustShowIds, ...selectedOptional.map(q => q.id)];

                    dailyState = {
                        date: todayStr,
                        selectedQuestIds: selectedIds,
                        resetCount: 0,
                    };

                    // Save the new state
                    set({
                        dailyQuestStates: {
                            ...state.dailyQuestStates,
                            [profileId]: dailyState,
                        },
                    });
                }

                // Build final quest list:
                // 1. All must-show quests
                // 2. Selected optional quests
                // 3. Any completed quests not already in the list
                const resultIds = new Set<string>(dailyState.selectedQuestIds);

                // Add completed quests that aren't already selected
                completedTodayIds.forEach(id => {
                    if (id && !resultIds.has(id)) {
                        resultIds.add(id);
                    }
                });

                // Return quests in order
                return state.quests.filter(q => resultIds.has(q.id));
            },

            resetDailyQuests: () => {
                const state = get();
                const profileId = state.activeProfileId || 'default';
                const todayStr = getTodayStr();
                const dailyState = state.dailyQuestStates[profileId];

                // Check if we can reset
                if (dailyState && dailyState.date === todayStr && dailyState.resetCount >= MAX_RESETS_PER_DAY) {
                    return false; // Already reset max times
                }

                // Get completed quest IDs (these will be preserved)
                const activeProfile = state.profiles.find(p => p.id === state.activeProfileId);
                const history = activeProfile?.history || state.history;
                const completedTodayIds = history
                    .filter(item => item.type === 'quest' && isToday(item.date))
                    .map(item => item.itemId)
                    .filter((id): id is string => id !== undefined);

                // Must-show quests
                const mustShowIds = state.quests.filter(q => q.mustShow).map(q => q.id);

                // Optional quests (excluding completed ones)
                const optionalQuests = state.quests.filter(
                    q => !q.mustShow && !completedTodayIds.includes(q.id)
                );

                // Pick new random quests
                const shuffled = [...optionalQuests].sort(() => Math.random() - 0.5);
                const selectedOptional = shuffled.slice(0, DAILY_QUEST_COUNT);
                const newSelectedIds = [...mustShowIds, ...selectedOptional.map(q => q.id), ...completedTodayIds];

                const newResetCount = (dailyState?.date === todayStr ? dailyState.resetCount : 0) + 1;

                set({
                    dailyQuestStates: {
                        ...state.dailyQuestStates,
                        [profileId]: {
                            date: todayStr,
                            selectedQuestIds: newSelectedIds,
                            resetCount: newResetCount,
                        },
                    },
                });

                return true;
            },

            getRemainingResets: () => {
                const state = get();
                const profileId = state.activeProfileId || 'default';
                const todayStr = getTodayStr();
                const dailyState = state.dailyQuestStates[profileId];

                if (!dailyState || dailyState.date !== todayStr) {
                    return MAX_RESETS_PER_DAY;
                }

                return Math.max(0, MAX_RESETS_PER_DAY - dailyState.resetCount);
            },

            // Reward Actions
            addReward: (reward) => set((state) => ({ rewards: [...state.rewards, reward] })),

            updateReward: (updatedReward) =>
                set((state) => ({
                    rewards: state.rewards.map((r) => (r.id === updatedReward.id ? updatedReward : r)),
                })),

            deleteReward: (id) =>
                set((state) => ({ rewards: state.rewards.filter((r) => r.id !== id) })),

            // History Actions (for parent control)
            deleteHistoryItem: (historyId) => {
                const state = get();
                const activeId = state.activeProfileId;

                if (activeId) {
                    // Find the item to get its point diff for reversal
                    const profile = state.profiles.find(p => p.id === activeId);
                    const item = profile?.history.find(h => h.id === historyId);

                    if (item) {
                        set({
                            profiles: state.profiles.map(p =>
                                p.id === activeId
                                    ? {
                                        ...p,
                                        currentPoints: p.currentPoints - item.pointDiff,
                                        totalPointsEarned: item.pointDiff > 0
                                            ? p.totalPointsEarned - item.pointDiff
                                            : p.totalPointsEarned,
                                        history: p.history.filter(h => h.id !== historyId),
                                    }
                                    : p
                            ),
                        });
                    }
                } else {
                    // Legacy mode
                    const item = state.history.find(h => h.id === historyId);
                    if (item) {
                        set({
                            currentPoints: state.currentPoints - item.pointDiff,
                            totalPointsEarned: item.pointDiff > 0
                                ? state.totalPointsEarned - item.pointDiff
                                : state.totalPointsEarned,
                            history: state.history.filter(h => h.id !== historyId),
                        });
                    }
                }
            },

            deleteHistoryByDate: (dateStr) => {
                const state = get();
                const activeId = state.activeProfileId;

                // Helper to check if item matches the date
                const matchesDate = (itemDate: string): boolean => {
                    const d = new Date(itemDate);
                    const targetDate = dateStr.split('-');
                    return d.getFullYear() === parseInt(targetDate[0]) &&
                        d.getMonth() === parseInt(targetDate[1]) - 1 &&
                        d.getDate() === parseInt(targetDate[2]);
                };

                if (activeId) {
                    const profile = state.profiles.find(p => p.id === activeId);
                    if (!profile) return;

                    const itemsToDelete = profile.history.filter(h => matchesDate(h.date));
                    const pointsToReverse = itemsToDelete.reduce((sum, h) => sum + h.pointDiff, 0);
                    const earnedToReverse = itemsToDelete
                        .filter(h => h.pointDiff > 0)
                        .reduce((sum, h) => sum + h.pointDiff, 0);

                    set({
                        profiles: state.profiles.map(p =>
                            p.id === activeId
                                ? {
                                    ...p,
                                    currentPoints: p.currentPoints - pointsToReverse,
                                    totalPointsEarned: p.totalPointsEarned - earnedToReverse,
                                    history: p.history.filter(h => !matchesDate(h.date)),
                                }
                                : p
                        ),
                    });
                } else {
                    // Legacy mode
                    const itemsToDelete = state.history.filter(h => matchesDate(h.date));
                    const pointsToReverse = itemsToDelete.reduce((sum, h) => sum + h.pointDiff, 0);
                    const earnedToReverse = itemsToDelete
                        .filter(h => h.pointDiff > 0)
                        .reduce((sum, h) => sum + h.pointDiff, 0);

                    set({
                        currentPoints: state.currentPoints - pointsToReverse,
                        totalPointsEarned: state.totalPointsEarned - earnedToReverse,
                        history: state.history.filter(h => !matchesDate(h.date)),
                    });
                }
            },

            // Backup & Restore
            importData: (data) => {
                set((state) => ({
                    ...state,
                    ...data,
                    quests: data.quests || state.quests,
                    rewards: data.rewards || state.rewards,
                    profiles: data.profiles || state.profiles,
                    activeProfileId: data.activeProfileId !== undefined ? data.activeProfileId : state.activeProfileId,
                    history: data.history || state.history,
                    currentPoints: typeof data.currentPoints === 'number' ? data.currentPoints : state.currentPoints,
                    totalPointsEarned: typeof data.totalPointsEarned === 'number' ? data.totalPointsEarned : state.totalPointsEarned,
                }));
            },

            resetData: () => {
                const defaultProfile = createDefaultProfile();
                set({
                    currentPoints: 0,
                    totalPointsEarned: 0,
                    quests: DEFAULT_QUESTS,
                    rewards: DEFAULT_REWARDS,
                    history: [],
                    profiles: [defaultProfile],
                    activeProfileId: defaultProfile.id,
                    dailyQuestStates: {},
                });
            },
        }),
        {
            name: 'otetsudai-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Export helper for available avatars
export const AVAILABLE_AVATARS = AVATAR_EMOJIS;
