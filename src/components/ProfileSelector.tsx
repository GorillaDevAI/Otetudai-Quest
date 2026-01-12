import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { AVATAR_EMOJIS } from '../lib/constants';
import { Modal } from './Modal';
import { Button } from './Button';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';

interface ProfileSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileSelector = ({ isOpen, onClose }: ProfileSelectorProps) => {
    const { i18n } = useTranslation();
    const isJa = i18n.language === 'ja';

    const profiles = useStore((s) => s.profiles);
    const activeProfileId = useStore((s) => s.activeProfileId);
    const addProfile = useStore((s) => s.addProfile);
    const updateProfile = useStore((s) => s.updateProfile);
    const deleteProfile = useStore((s) => s.deleteProfile);
    const setActiveProfile = useStore((s) => s.setActiveProfile);

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState(AVATAR_EMOJIS[0]);

    const handleAddProfile = () => {
        if (!newName.trim()) return;
        addProfile(newName.trim(), newIcon);
        setNewName('');
        setNewIcon(AVATAR_EMOJIS[0]);
        setIsAddingNew(false);
    };

    const handleUpdateProfile = (id: string) => {
        if (!newName.trim()) return;
        updateProfile(id, newName.trim(), newIcon);
        setEditingId(null);
        setNewName('');
    };

    const handleSelectProfile = (id: string) => {
        setActiveProfile(id);
        onClose();
    };

    const startEditing = (profile: typeof profiles[0]) => {
        setEditingId(profile.id);
        setNewName(profile.name);
        setNewIcon(profile.icon);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isJa ? 'プロフィールをえらぶ' : 'Select Profile'}
        >
            <div className="space-y-4">
                {/* Profile List */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {profiles.map((profile) => (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all ${profile.id === activeProfileId
                                    ? 'bg-blue-50 border-blue-400'
                                    : 'bg-white border-slate-200 hover:border-blue-200'
                                    }`}
                            >
                                {editingId === profile.id ? (
                                    // Edit Mode
                                    // Edit Mode
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="flex gap-1 justify-center flex-wrap">
                                            {AVATAR_EMOJIS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => setNewIcon(emoji)}
                                                    className={`text-2xl p-1 rounded-lg transition-transform ${newIcon === emoji
                                                        ? 'bg-blue-200 scale-110 shadow-sm'
                                                        : 'hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="flex-1 p-2 border rounded-lg text-sm font-bold"
                                                maxLength={10}
                                                autoFocus
                                            />
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleUpdateProfile(profile.id)}
                                            >
                                                <Check size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <>
                                        <button
                                            onClick={() => handleSelectProfile(profile.id)}
                                            className="flex items-center gap-3 flex-1"
                                        >
                                            <span className="text-3xl">{profile.icon}</span>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-700">{profile.name}</div>
                                                <div className="text-xs text-slate-400">
                                                    🪙 {profile.currentPoints.toLocaleString()} pt
                                                </div>
                                            </div>
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => startEditing(profile)}
                                                className="p-2 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {profiles.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(isJa ? 'このプロフィールを削除しますか？' : 'Delete this profile?')) {
                                                            deleteProfile(profile.id);
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Add New Profile */}
                {isAddingNew ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-slate-50 rounded-xl space-y-3"
                    >
                        <div className="flex gap-2 justify-center">
                            {AVATAR_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => setNewIcon(emoji)}
                                    className={`text-3xl p-2 rounded-xl transition-all ${newIcon === emoji
                                        ? 'bg-blue-500 scale-110 shadow-lg'
                                        : 'bg-white hover:bg-blue-100'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder={isJa ? 'なまえ (10もじまで)' : 'Name (max 10 chars)'}
                            className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold focus:border-blue-400 focus:outline-none"
                            maxLength={10}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={() => {
                                    setIsAddingNew(false);
                                    setNewName('');
                                }}
                            >
                                {isJa ? 'キャンセル' : 'Cancel'}
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleAddProfile}
                                disabled={!newName.trim()}
                            >
                                {isJa ? 'ついか' : 'Add'}
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    profiles.length < 5 && (
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => setIsAddingNew(true)}
                        >
                            <Plus size={20} className="mr-2" />
                            {isJa ? 'プロフィールをついか' : 'Add Profile'}
                        </Button>
                    )
                )}

                {profiles.length >= 5 && (
                    <p className="text-center text-sm text-slate-400">
                        {isJa ? '最大5人まで登録できます' : 'Maximum 5 profiles allowed'}
                    </p>
                )}
            </div>
        </Modal>
    );
};
