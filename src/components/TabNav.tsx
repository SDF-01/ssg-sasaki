import type { CSSProperties } from 'react';

import { useLanguage } from '../LanguageProvider';
import type { TabId } from '../types';

interface TabNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; labelKey: 'tab.videos' | 'tab.music' | 'tab.accounts' | 'tab.add'; emoji: string }[] = [
  { id: 'videos', labelKey: 'tab.videos', emoji: '🎬' },
  { id: 'music', labelKey: 'tab.music', emoji: '💿' },
  { id: 'accounts', labelKey: 'tab.accounts', emoji: '💌' },
  { id: 'add', labelKey: 'tab.add', emoji: '✨' },
];

export function TabNav({ active, onChange }: TabNavProps) {
  const { tr } = useLanguage();

  return (
    <nav className="tab-nav" aria-label={tr('tab.navAria')}>
      {TABS.map((tab, i) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-btn ${active === tab.id ? 'active' : ''}`}
          style={{ '--tab-rotate': `${(i - 1) * 2}deg` } as CSSProperties}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-emoji" aria-hidden="true">
            {tab.emoji}
          </span>
          <span className="tab-label">{tr(tab.labelKey)}</span>
          {active === tab.id ? (
            <span className="tab-heart" aria-hidden="true">
              ♡
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}
