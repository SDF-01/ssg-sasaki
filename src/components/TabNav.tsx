import type { CSSProperties } from 'react';

import type { TabId } from '../types';

interface TabNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; labelJp: string; emoji: string }[] = [
  { id: 'videos', label: 'YouTube', labelJp: '動画', emoji: '▶' },
  { id: 'music', label: 'Music', labelJp: '音楽', emoji: '♫' },
  { id: 'accounts', label: 'Accounts', labelJp: '公式', emoji: '◎' },
];

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="tab-nav" aria-label="Main sections">
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
          <span className="tab-label">
            <span className="tab-label-en">{tab.label}</span>
            <span className="tab-label-jp">{tab.labelJp}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}
