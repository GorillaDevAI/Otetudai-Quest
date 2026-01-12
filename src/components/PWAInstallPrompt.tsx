import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
    const { i18n } = useTranslation();
    const isJa = i18n.language === 'ja';

    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if already installed as PWA
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        setIsStandalone(standalone);

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Check if previously dismissed
        const wasDismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (wasDismissed) {
            const dismissedTime = parseInt(wasDismissed, 10);
            // Show again after 7 days
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                setDismissed(true);
            }
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show install prompt after a short delay
            setTimeout(() => setShowPrompt(true), 2000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // For iOS, show the prompt after a delay if not standalone
        if (iOS && !standalone && !wasDismissed) {
            setTimeout(() => setShowPrompt(true), 3000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    // Don't show if already installed, dismissed, or no prompt available (non-iOS)
    if (isStandalone || dismissed || (!showPrompt)) {
        return null;
    }

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">
                                        {isJa ? 'アプリをインストール' : 'Install App'}
                                    </h3>
                                    <p className="text-blue-100 text-xs font-medium">
                                        {isJa ? 'ホームがめんに追加しよう！' : 'Add to home screen!'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="text-white/70 hover:text-white p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-slate-600">
                                {isJa
                                    ? 'アプリとしてインストールすると、すぐにアクセスできてべんりだよ！'
                                    : 'Install as an app for quick access and a better experience!'}
                            </p>

                            {isIOS ? (
                                // iOS instructions
                                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                    <p className="text-sm font-bold text-slate-700">
                                        {isJa ? '📱 インストールのしかた:' : '📱 How to install:'}
                                    </p>
                                    <ol className="text-sm text-slate-600 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                            <span className="flex items-center gap-1">
                                                {isJa ? '下の ' : 'Tap '}
                                                <Share size={16} className="text-blue-500" />
                                                {isJa ? ' をタップ' : ' below'}
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                            <span>
                                                {isJa ? '「ホーム画面に追加」をタップ' : 'Tap "Add to Home Screen"'}
                                            </span>
                                        </li>
                                    </ol>
                                </div>
                            ) : (
                                // Android/Desktop install button
                                <Button
                                    variant="primary"
                                    onClick={handleInstall}
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 border-green-700"
                                >
                                    <Download size={20} className="mr-2" />
                                    {isJa ? 'いますぐインストール' : 'Install Now'}
                                </Button>
                            )}

                            <button
                                onClick={handleDismiss}
                                className="w-full text-center text-sm text-slate-400 hover:text-slate-600"
                            >
                                {isJa ? 'あとで' : 'Later'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
