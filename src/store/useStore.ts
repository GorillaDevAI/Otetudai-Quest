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

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Multi-profile support
            profiles: [],
            activeProfileId: null,

            // Global settings
            quests: DEFAULT_QUESTS,
            rewards: DEFAULT_REWARDS,

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

            // Reward Actions
            addReward: (reward) => set((state) => ({ rewards: [...state.rewards, reward] })),

            updateReward: (updatedReward) =>
                set((state) => ({
                    rewards: state.rewards.map((r) => (r.id === updatedReward.id ? updatedReward : r)),
                })),

            deleteReward: (id) =>
                set((state) => ({ rewards: state.rewards.filter((r) => r.id !== id) })),

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
