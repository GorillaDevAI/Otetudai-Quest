import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home, Gift, Calendar, Settings } from 'lucide-react';

type TabType = 'home' | 'rewards' | 'history' | 'settings';

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
    const { i18n } = useTranslation();
    const isJa = i18n.language === 'ja';

    const tabs: { id: TabType; icon: typeof Home; labelJa: string; labelEn: string }[] = [
        { id: 'home', icon: Home, labelJa: 'ホーム', labelEn: 'Home' },
        { id: 'rewards', icon: Gift, labelJa: 'ごほうび', labelEn: 'Rewards' },
        { id: 'history', icon: Calendar, labelJa: 'きろく', labelEn: 'History' },
        { id: 'settings', icon: Settings, labelJa: 'せってい', labelEn: 'Settings' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-100 shadow-lg">
            <div className="max-w-md mx-auto flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <motion.button
                            key={tab.id}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${isActive
                                    ? 'text-blue-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <div className="relative">
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                                    />
                                )}
                            </div>
                            <span className={`text-xs font-bold ${isActive ? '' : 'font-medium'}`}>
                                {isJa ? tab.labelJa : tab.labelEn}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
            {/* Safe area for iOS */}
            <div className="h-safe-area-inset-bottom bg-white" />
        </nav>
    );
};
