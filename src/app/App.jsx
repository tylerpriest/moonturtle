import { useState } from 'react';
import { TabBar } from '../ui/components/Primitives.jsx';
import { BirthSetup, Permission } from '../ui/screens/Onboarding.jsx';
import { TodayScreen } from '../ui/screens/TodayScreen.jsx';
import { SkyScreen } from '../ui/screens/SkyScreen.jsx';
import { ProfileScreen } from '../ui/screens/ProfileScreen.jsx';
import { AskScreen } from '../ui/screens/AskScreen.jsx';
import { MethodScreen } from '../ui/screens/MethodScreen.jsx';
import { JournalScreen } from '../ui/screens/JournalScreen.jsx';
import { clearAllMoonTurtleData, getSettings, getUser, saveSettings, saveUser } from '../io/storage.js';
import { useReading } from '../reading/useReading.js';
import { useProfileReading } from '../reading/useProfileReading.js';
import { formatEngineLabel, engineForSettings } from '../reading/generate.js';

function AppTopBar({ settings, readingState, onSettings }) {
  const engine = readingState?.loading?.engine ?? readingState?.reading?.engine ?? engineForSettings(settings);
  const status = readingState?.loading?.statusLabel
    ?? readingState?.interpretationStatus?.statusLabel
    ?? (readingState?.reading?.isFallback ? 'Fallback shown' : 'Settings');
  return (
    <div className="app-global-bar">
      <button type="button" className="settings-trigger" onClick={onSettings}>
        <span className="settings-trigger-title">{status}</span>
        <span className="settings-trigger-engine">{formatEngineLabel(engine)}</span>
      </button>
    </div>
  );
}

function SettingsSheet({ settings, readingState, onSettingsChange, onResetLocalData, onClose }) {
  return (
    <div className="settings-sheet-backdrop" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="settings-sheet">
        <div className="settings-sheet-header">
          <div>
            <div className="eyebrow">Settings</div>
            <div className="status-title">Engine, keys, and method.</div>
          </div>
          <button type="button" className="settings-close" onClick={onClose}>Close</button>
        </div>
        <div className="settings-sheet-scroll">
          <MethodScreen
            state={readingState}
            settings={settings}
            onSettingsChange={onSettingsChange}
            onResetLocalData={onResetLocalData}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => getUser());
  const [settings, setSettings] = useState(() => getSettings());
  const [draftUser, setDraftUser] = useState(null);
  const [onboardStep, setOnboardStep] = useState(user ? 2 : 0); // 0=birth, 1=permission, 2=done
  const [tab, setTab] = useState('today');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const readingState = useReading(user, settings);
  const profileState = useProfileReading(user, settings, tab === 'profile' || tab === 'ask');

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
    setSettingsOpen(false);
  }

  if (onboardStep === 0) return <BirthSetup onNext={handleBirthComplete}/>;
  if (onboardStep === 1) return <Permission draftUser={draftUser} onDone={handleOnboardingComplete}/>;

  return (
    <div className="app-shell">
      <AppTopBar settings={settings} readingState={readingState} onSettings={() => setSettingsOpen(true)}/>
      <div className="screen-scroll">
        {tab === 'today'   && <TodayScreen  state={readingState} user={user} onTab={setTab}/>}
        {tab === 'sky'     && <SkyScreen    state={readingState} onTab={setTab}/>}
        {tab === 'profile' && <ProfileScreen state={readingState} profileState={profileState} user={user}/>}
        {tab === 'ask'     && <AskScreen state={readingState} profileState={profileState} settings={settings}/>}
        {tab === 'journal' && <JournalScreen state={readingState} onTab={setTab}/>}
      </div>
      <TabBar active={tab} onTab={setTab}/>
      {settingsOpen && (
        <SettingsSheet
          settings={settings}
          readingState={readingState}
          onSettingsChange={handleSettingsChange}
          onResetLocalData={handleResetLocalData}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
