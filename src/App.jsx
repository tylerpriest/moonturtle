import { useState } from 'react';
import { TabBar } from './components/Primitives.jsx';
import { BirthSetup, Permission } from './screens/Onboarding.jsx';
import { TodayScreen } from './screens/TodayScreen.jsx';
import { SkyScreen } from './screens/SkyScreen.jsx';
import { NatalScreen } from './screens/NatalScreen.jsx';
import { MethodScreen } from './screens/MethodScreen.jsx';
import { JournalScreen } from './screens/JournalScreen.jsx';

export default function App() {
  const [onboardStep, setOnboardStep] = useState(0); // 0=birth, 1=permission, 2=done
  const [tab, setTab] = useState('today');

  if (onboardStep === 0) return <BirthSetup onNext={() => setOnboardStep(1)}/>;
  if (onboardStep === 1) return <Permission onDone={() => setOnboardStep(2)}/>;

  return (
    <div className="app-shell">
      <div className="screen-scroll">
        {tab === 'today'   && <TodayScreen  onTab={setTab}/>}
        {tab === 'sky'     && <SkyScreen    onTab={setTab}/>}
        {tab === 'natal'   && <NatalScreen  onTab={setTab}/>}
        {tab === 'journal' && <JournalScreen onTab={setTab}/>}
        {tab === 'method'  && <MethodScreen  onTab={setTab}/>}
      </div>
      <TabBar active={tab} onTab={setTab}/>
    </div>
  );
}
