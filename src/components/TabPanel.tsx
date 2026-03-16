import { useState, type ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  tabs: Tab[];
  defaultTab?: string;
}

export function TabPanel({ tabs, defaultTab }: Props) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const current = tabs.find((t) => t.id === active);

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-[#e2e8f0] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors relative ${
              active === tab.id
                ? 'text-[#0072CE]'
                : 'text-[#94a3b8] hover:text-[#64748b]'
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0072CE] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-6">
        {current?.content}
      </div>
    </div>
  );
}
