export interface Quest {
    id: string;
    title: string;      // Japanese title (default)
    titleEn?: string;   // English title (optional)
    point: number;
    icon: string;       // Icon identifier
}

export interface Reward {
    id: string;
    title: string;      // Japanese title (default)
    titleEn?: string;   // English title (optional)
    cost: number;
    icon: string;
}

export type HistoryType = 'quest' | 'reward' | 'manual_adjust';

export interface HistoryItem {
    id: string;
    date: string; // ISO string
    type: HistoryType;
    itemId?: string; // ID of quest or reward
    itemTitle?: string; // Store title in case item is deleted
    pointDiff: number; // +50 or -300
}

export interface AppState {
    currentPoints: number;
    totalPointsEarned: number;
    quests: Quest[];
    rewards: Reward[];
    history: HistoryItem[];

    // Actions
    addPoints: (amount: number, reason: HistoryType, itemId?: string, itemTitle?: string) => void;
    removePoints: (amount: number, reason: HistoryType, itemId?: string, itemTitle?: string) => void;
    addQuest: (quest: Quest) => void;
    updateQuest: (quest: Quest) => void;
    deleteQuest: (id: string) => void;
    addReward: (reward: Reward) => void;
    updateReward: (reward: Reward) => void;
    deleteReward: (id: string) => void;

    // Onboarding
    isFirstLaunch: boolean;
    completeOnboarding: () => void;

    // Backup/Restore
    importData: (data: Partial<AppState>) => void;
    resetData: () => void;
}
