import { useState } from 'react';
import { KidPage } from './pages/KidPage';
import { ParentPage } from './pages/ParentPage';
import { HistoryPage } from './pages/HistoryPage';
import { RewardsPage } from './pages/RewardsPage';
import { BottomNav } from './components/BottomNav';
import { WelcomeWizard } from './components/WelcomeWizard';
import { TutorialOverlay } from './components/TutorialOverlay';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { ParentGate } from './components/ParentGate';
import { useStore } from './store/useStore';

type TabType = 'home' | 'rewards' | 'history' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isParentMode, setIsParentMode] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const isFirstLaunch = useStore((state) => state.isFirstLaunch);

  const handleSettingsClick = () => {
    setShowParentGate(true);
  };

  const handleParentGateSuccess = () => {
    setShowParentGate(false);
    setIsParentMode(true);
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'settings') {
      handleSettingsClick();
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="pb-20">
      {isFirstLaunch && <WelcomeWizard />}
      <TutorialOverlay />

      {/* Parent Gate Modal */}
      <ParentGate
        isOpen={showParentGate}
        onSuccess={handleParentGateSuccess}
        onClose={() => setShowParentGate(false)}
      />

      {isParentMode ? (
        <ParentPage onSwitchMode={() => setIsParentMode(false)} />
      ) : (
        <>
          {activeTab === 'home' && <KidPage />}
          {activeTab === 'rewards' && <RewardsPage />}
          {activeTab === 'history' && <HistoryPage />}

          <PWAInstallPrompt />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}
    </div>
  );
}

export default App;
