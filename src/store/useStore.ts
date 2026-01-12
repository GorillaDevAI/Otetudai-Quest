import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type AppState, type Quest, type Reward, type HistoryType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initial default data with bilingual support
const DEFAULT_QUESTS: Quest[] = [
    { id: 'q1', title: 'おさらあらい', titleEn: 'Wash Dishes', point: 50, icon: '🍽️' },
    { id: 'q2', title: 'おふろそうじ', titleEn: 'Clean Bathroom', point: 100, icon: '🛁' },
    { id: 'q3', title: 'くつそろえ', titleEn: 'Organize Shoes', point: 10, icon: '👟' },
    { id: 'q4', title: 'せんたくたたみ', titleEn: 'Fold Laundry', point: 30, icon: '👕' },
];

const DEFAULT_REWARDS: Reward[] = [
    { id: 'r1', title: 'Youtube 30ぷん', titleEn: 'YouTube 30min', cost: 300, icon: '📺' },
    { id: 'r2', title: 'おやつ 1つ', titleEn: 'One Snack', cost: 150, icon: '🍭' },
    { id: 'r3', title: 'ゲーム 1じかん', titleEn: 'Gaming 1hr', cost: 500, icon: '🎮' },
];

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentPoints: 0,
            totalPointsEarned: 0,
            quests: DEFAULT_QUESTS,
            rewards: DEFAULT_REWARDS,
            history: [],
            isFirstLaunch: true,

            completeOnboarding: () => set({ isFirstLaunch: false }),

            addPoints: (amount, type, itemId, itemTitle) => {
                set((state) => ({
                    currentPoints: state.currentPoints + amount,
                    totalPointsEarned: state.totalPointsEarned + amount,
                    history: [
                        {
                            id: uuidv4(),
                            date: new Date().toISOString(),
                            type,
                            itemId,
                            itemTitle,
                            pointDiff: amount,
                        },
                        ...state.history,
                    ],
                }));
            },

            removePoints: (amount, type, itemId, itemTitle) => {
                set((state) => ({
                    currentPoints: Math.max(0, state.currentPoints - amount),
                    history: [
                        {
                            id: uuidv4(),
                            date: new Date().toISOString(),
                            type,
                            itemId,
                            itemTitle,
                            pointDiff: -amount,
                        },
                        ...state.history,
                    ],
                }));
            },

            addQuest: (quest) => set((state) => ({ quests: [...state.quests, quest] })),
            updateQuest: (updatedQuest) =>
                set((state) => ({
                    quests: state.quests.map((q) => (q.id === updatedQuest.id ? updatedQuest : q)),
                })),
            deleteQuest: (id) =>
                set((state) => ({ quests: state.quests.filter((q) => q.id !== id) })),

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
                    // Ensure we don't break existing structure if imported data is partial
                    quests: data.quests || state.quests,
                    rewards: data.rewards || state.rewards,
                    history: data.history || state.history,
                    currentPoints: typeof data.currentPoints === 'number' ? data.currentPoints : state.currentPoints,
                    totalPointsEarned: typeof data.totalPointsEarned === 'number' ? data.totalPointsEarned : state.totalPointsEarned,
                }));
            },

            resetData: () => {
                set({
                    currentPoints: 0,
                    totalPointsEarned: 0,
                    quests: DEFAULT_QUESTS,
                    rewards: DEFAULT_REWARDS,
                    history: [],
                });
            },
        }),
        {
            name: 'otetsudai-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage),
        }
    )
);
