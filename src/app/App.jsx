import { useState } from 'react';
import { TabBar } from '../ui/components/Primitives.jsx';
import { BirthSetup, Permission } from '../ui/screens/Onboarding.jsx';
import { TodayScreen } from '../ui/screens/TodayScreen.jsx';
import { SkyScreen } from '../ui/screens/SkyScreen.jsx';
import { NatalScreen } from '../ui/screens/NatalScreen.jsx';
import { MethodScreen } from '../ui/screens/MethodScreen.jsx';
import { JournalScreen } from '../ui/screens/JournalScreen.jsx';
import { clearAllMoonTurtleData, getSettings, getUser, saveSettings, saveUser } from '../io/storage.js';
import { useReading } from '../reading/useReading.js';

export default function App() {
  const [user, setUser] = useState(() => getUser());
  const [settings, setSettings] = useState(() => getSettings());
  const [draftUser, setDraftUser] = useState(null);
  const [onboardStep, setOnboardStep] = useState(user ? 2 : 0); // 0=birth, 1=permission, 2=done
  const [tab, setTab] = useState('today');
  const readingState = useReading(user, settings);

  function handleBirthComplete(nextUser) {
    setDraftUser(nextUser);
    setOnboardStep(1);
  }

  function handleOnboardingComplete(nextUser) {
    const saved = saveUser(nextUser);
    setUser(saved);
    setDraftUser(null);
    setOnboardStep(2);
  }

  function handleSettingsChange(nextSettings) {
    const saved = saveSettings({ ...settings, ...nextSettings });
    setSettings(saved);
  }

  function handleResetLocalData() {
    clearAllMoonTurtleData();
    setUser(null);
    setSettings(getSettings());
    setDraftUser(null);
    setOnboardStep(0);
    setTab('today');
  }

  if (onboardStep === 0) return <BirthSetup onNext={handleBirthComplete}/>;
  if (onboardStep === 1) return <Permission draftUser={draftUser} onDone={handleOnboardingComplete}/>;

  return (
    <div className="app-shell">
      <div className="screen-scroll">
        {tab === 'today'   && <TodayScreen  state={readingState} user={user} onTab={setTab}/>}
        {tab === 'sky'     && <SkyScreen    state={readingState} onTab={setTab}/>}
        {tab === 'natal'   && <NatalScreen  state={readingState} user={user} onTab={setTab}/>}
        {tab === 'journal' && <JournalScreen state={readingState} onTab={setTab}/>}
        {tab === 'method'  && <MethodScreen state={readingState} settings={settings} onSettingsChange={handleSettingsChange} onResetLocalData={handleResetLocalData} onTab={setTab}/>}
      </div>
      <TabBar active={tab} onTab={setTab}/>
    </div>
  );
}
