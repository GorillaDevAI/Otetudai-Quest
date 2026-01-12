import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { AddItemModal } from '../components/AddItemModal';
import { ArrowLeft, Upload, Download, Trash2, Plus, Pencil } from 'lucide-react';
import { type Quest, type Reward } from '../types';

import { useLocalizedTitle } from '../lib/useLocalizedTitle';

export const ParentPage = ({ onSwitchMode }: { onSwitchMode: () => void }) => {
    const { t, i18n } = useTranslation();
    const { getQuestTitle, getRewardTitle } = useLocalizedTitle();
    const store = useStore();
    const [activeTab, setActiveTab] = useState<'quests' | 'rewards' | 'data'>('quests');
    const [addItemType, setAddItemType] = useState<'quest' | 'reward' | null>(null);
    const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            currentPoints: store.currentPoints,
            totalPointsEarned: store.totalPointsEarned,
            quests: store.quests,
            rewards: store.rewards,
            history: store.history,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `otetsudai-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert(t('parent.savedMessage'));
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                if (confirm(t('parent.restoreConfirm'))) {
                    store.importData(data);
                    alert(t('parent.restoredMessage'));
                }
            } catch (err) {
                alert(t('parent.restoreError'));
            }
        };
        reader.readAsText(file);

        // Reset file input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveItem = (title: string, point: number, icon: string, oncePerDay?: boolean) => {
        if (editingQuest) {
            // Update existing quest
            store.updateQuest({
                ...editingQuest,
                title,
                point,
                icon,
                oncePerDay: oncePerDay || false,
            });
            setEditingQuest(null);
        } else if (editingReward) {
            // Update existing reward
            store.updateReward({
                ...editingReward,
                title,
                cost: point,
                icon,
            });
            setEditingReward(null);
        } else if (addItemType === 'quest') {
            // Add new quest
            store.addQuest({
                id: crypto.randomUUID(),
                title,
                point,
                icon,
                oncePerDay: oncePerDay || false,
            });
        } else if (addItemType === 'reward') {
            // Add new reward
            store.addReward({
                id: crypto.randomUUID(),
                title,
                cost: point,
                icon,
            });
        }
    };

    const handleCloseModal = () => {
        setAddItemType(null);
        setEditingQuest(null);
        setEditingReward(null);
    };

    const isModalOpen = !!addItemType || !!editingQuest || !!editingReward;
    const modalType = editingQuest ? 'quest' : editingReward ? 'reward' : addItemType || 'quest';
    const editItem = editingQuest || editingReward || null;


    return (
        <div className="min-h-screen bg-slate-100 pb-20">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={onSwitchMode} className="!p-2 mr-2">
                            <ArrowLeft size={24} />
                        </Button>
                        <h1 className="text-xl font-bold text-slate-700">{t('parent.title')}</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* Navigation Tabs */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm">
                    {(['quests', 'rewards', 'data'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab === 'quests' && t('parent.quests')}
                            {tab === 'rewards' && t('parent.rewards')}
                            {tab === 'data' && t('parent.dataManagement')}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-4">

                    {/* QUESTS TAB */}
                    {activeTab === 'quests' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold text-slate-500">{t('parent.questList')}</h2>
                                <Button variant="primary" size="sm" className="bg-green-500 border-green-700 h-8 text-sm" onClick={() => setAddItemType('quest')}>
                                    <Plus size={16} className="mr-1" /> {t('parent.add')}
                                </Button>
                            </div>
                            {store.quests.map((quest) => (
                                <Card key={quest.id} className="p-4 bg-white">
                                    <div className="flex items-center justify-between mb-3">
                                        <div
                                            className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-70 transition-opacity"
                                            onClick={() => setEditingQuest(quest)}
                                        >
                                            <span className="text-3xl">{quest.icon}</span>
                                            <div>
                                                <div className="font-bold flex items-center gap-1">
                                                    {getQuestTitle(quest)}
                                                    <Pencil size={14} className="text-slate-400" />
                                                </div>
                                                <div className="text-sm font-bold text-orange-500">🪙 {quest.point}pt</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-red-400 hover:text-red-500" onClick={() => {
                                            if (confirm(t('parent.deleteConfirm'))) store.deleteQuest(quest.id);
                                        }}>
                                            <Trash2 size={20} />
                                        </Button>
                                    </div>

                                    {/* Once Per Day Toggle */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                        <span className="text-xs text-slate-400 mr-auto">
                                            {t('parent.completionLimit') || (i18n.language === 'ja' ? '完了せいげん:' : 'Limit:')}
                                        </span>
                                        <button
                                            onClick={() => store.updateQuest({ ...quest, oncePerDay: false })}
                                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${!quest.oncePerDay
                                                ? 'bg-green-500 text-white'
                                                : 'bg-slate-100 text-slate-400 hover:bg-green-100'
                                                }`}
                                        >
                                            🔄 {i18n.language === 'ja' ? 'なんかいでも' : 'Unlimited'}
                                        </button>
                                        <button
                                            onClick={() => store.updateQuest({ ...quest, oncePerDay: true })}
                                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${quest.oncePerDay
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-slate-100 text-slate-400 hover:bg-orange-100'
                                                }`}
                                        >
                                            1️⃣ {i18n.language === 'ja' ? '1日1回' : 'Once/day'}
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* REWARDS TAB */}
                    {activeTab === 'rewards' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold text-slate-500">{t('parent.rewardList')}</h2>
                                <Button variant="primary" size="sm" className="bg-green-500 border-green-700 h-8 text-sm" onClick={() => setAddItemType('reward')}>
                                    <Plus size={16} className="mr-1" /> {t('parent.add')}
                                </Button>
                            </div>
                            {store.rewards.map((reward) => (
                                <Card key={reward.id} className="p-4 flex items-center justify-between bg-white">
                                    <div
                                        className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={() => setEditingReward(reward)}
                                    >
                                        <span className="text-3xl">{reward.icon}</span>
                                        <div>
                                            <div className="font-bold flex items-center gap-1">
                                                {getRewardTitle(reward)}
                                                <Pencil size={14} className="text-slate-400" />
                                            </div>
                                            <div className="text-sm font-bold text-orange-500">🪙 {reward.cost}pt</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="text-red-400 hover:text-red-500" onClick={() => {
                                        if (confirm(t('parent.deleteConfirm'))) store.deleteReward(reward.id);
                                    }}>
                                        <Trash2 size={20} />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* DATA TAB */}
                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            <Card className="p-4 bg-white space-y-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Download size={20} /> {t('parent.backup')}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {t('parent.backupDesc')}
                                </p>
                                <Button variant="secondary" onClick={handleExport} className="w-full">
                                    {t('parent.saveToFile')}
                                </Button>
                            </Card>

                            <Card className="p-4 bg-white space-y-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Upload size={20} /> {t('parent.restore')}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {t('parent.restoreDesc')}
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".json,application/json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                                <Button
                                    variant="primary"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full"
                                >
                                    {t('parent.restoreBtn')}
                                </Button>
                            </Card>

                            <div className="pt-8 border-t">
                                <Button variant="danger" className="w-full" onClick={() => {
                                    if (confirm(t('parent.resetConfirm'))) store.resetData();
                                }}>
                                    {t('parent.resetAll')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <AddItemModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveItem}
                type={modalType}
                editItem={editItem}
            />
        </div>
    );
};
