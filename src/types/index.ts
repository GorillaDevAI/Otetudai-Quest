export interface Quest {
    id: string;
    title: string;      // Japanese title (default)
    titleEn?: string;   // English title (optional)
    point: number;
    icon: string;       // Icon identifier
    oncePerDay?: boolean; // Optional: limit to once per day
    mustShow?: boolean;   // Always show this quest (e.g., homework)
}

// Daily quest selection state (per profile)
export interface DailyQuestState {
    date: string;           // Date string (YYYY-MM-DD)
    selectedQuestIds: string[]; // Currently displayed quest IDs
    resetCount: number;     // Number of resets today (max 2)
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
    profileId?: string; // Which profile completed this
}

// Child Profile
export interface ChildProfile {
    id: string;
    name: string;
    icon: string; // emoji avatar
    currentPoints: number;
    totalPointsEarned: number;
    history: HistoryItem[];
    createdAt: string;
}

export interface AppState {
    // Multi-profile support
    profiles: ChildProfile[];
    activeProfileId: string | null;

    // Global settings
    quests: Quest[];
    rewards: Reward[];

    // Daily quest state per profile
    dailyQuestStates: { [profileId: string]: DailyQuestState };

    // Legacy single-profile fields (for backward compatibility)
    currentPoints: number;
    totalPointsEarned: number;
    history: HistoryItem[];

    // Profile Actions
    addProfile: (name: string, icon: string) => void;
    updateProfile: (id: string, name: string, icon: string) => void;
    deleteProfile: (id: string) => void;
    setActiveProfile: (id: string) => void;
    getActiveProfile: () => ChildProfile | null;

    // Actions (now profile-aware)
    addPoints: (amount: number, reason: HistoryType, itemId?: string, itemTitle?: string) => void;
    removePoints: (amount: number, reason: HistoryType, itemId?: string, itemTitle?: string) => void;

    // Quest Actions (updated for once-per-day option)
    addQuest: (quest: Quest) => void;
    updateQuest: (quest: Quest) => void;
    deleteQuest: (id: string) => void;
    isQuestCompletedToday: (questId: string) => boolean;

    // Daily Quest Selection Actions
    getDailyQuests: () => Quest[];
    resetDailyQuests: () => boolean; // Returns false if already reset 2 times today
    getRemainingResets: () => number;

    // Reward Actions
    addReward: (reward: Reward) => void;
    updateReward: (reward: Reward) => void;
    deleteReward: (id: string) => void;

    // History Actions (for parent control)
    deleteHistoryItem: (historyId: string) => void;
    deleteHistoryByDate: (dateStr: string) => void; // Date in YYYY-MM-DD format

    // Onboarding
    isFirstLaunch: boolean;
    completeOnboarding: () => void;

    // Post-onboarding tutorial
    showTutorial: boolean;
    completeTutorial: () => void;

    // Backup/Restore
    importData: (data: Partial<AppState>) => void;
    resetData: () => void;
}
