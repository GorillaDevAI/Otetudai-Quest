import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KidPage } from './pages/KidPage';
import { ParentPage } from './pages/ParentPage';
import { HistoryPage } from './pages/HistoryPage';
import { RewardsPage } from './pages/RewardsPage';
import { BottomNav } from './components/BottomNav';

type TabType = 'home' | 'rewards' | 'history' | 'settings';

// Generate a random math problem for parent authentication
const generateMathProblem = () => {
  const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
  const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
  const isAddition = Math.random() > 0.5;

  if (isAddition) {
    return {
      question: `${num1} + ${num2} = ?`,
      answer: num1 + num2,
    };
  } else {
    // Ensure result is positive
    const larger = Math.max(num1, num2);
    const smaller = Math.min(num1, num2);
    return {
      question: `${larger} - ${smaller} = ?`,
      answer: larger - smaller,
    };
  }
};

function App() {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isParentMode, setIsParentMode] = useState(false);

  const handleSettingsClick = () => {
    const problem = generateMathProblem();
    const isJa = i18n.language === 'ja';

    const promptMessage = isJa
      ? `おとなようです！\nこたえをいれてね: ${problem.question}`
      : `For adults only!\nSolve: ${problem.question}`;

    const userAnswer = prompt(promptMessage);

    if (userAnswer !== null && parseInt(userAnswer) === problem.answer) {
      setIsParentMode(true);
    } else if (userAnswer !== null) {
      const errorMessage = isJa ? 'ざんねん！こたえがちがうよ' : 'Oops! Wrong answer';
      alert(errorMessage);
    }
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'settings') {
      handleSettingsClick();
    } else {
      setActiveTab(tab);
    }
  };

  // Parent mode is a separate full-screen view
  if (isParentMode) {
    return <ParentPage onSwitchMode={() => setIsParentMode(false)} />;
  }

  return (
    <div className="pb-20">
      {activeTab === 'home' && <KidPage />}
      {activeTab === 'rewards' && <RewardsPage />}
      {activeTab === 'history' && <HistoryPage />}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default App;
