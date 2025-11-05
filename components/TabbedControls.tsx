

import React, { useState, ReactNode, useEffect } from 'react';

interface TabbedControlsProps {
  tabs: { [key: string]: ReactNode };
  initialActiveTab?: string;
}

// Fix: Switched to a default export for better compatibility with React.lazy.
const TabbedControls: React.FC<TabbedControlsProps> = ({ tabs, initialActiveTab }) => {
  const tabKeys = Object.keys(tabs);
  const [activeTab, setActiveTab] = useState(initialActiveTab && tabKeys.includes(initialActiveTab) ? initialActiveTab : tabKeys[0]);

  useEffect(() => {
    if (initialActiveTab && tabKeys.includes(initialActiveTab)) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab, tabKeys]);

  return (
    <div>
      <div className="bg-slate-200/70 dark:bg-zinc-800/50 rounded-lg p-1 flex items-center mb-6 shadow-inner">
        {tabKeys.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-2 px-1 rounded-md font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 dark:focus:ring-offset-zinc-900
              ${
                activeTab === tab
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow'
                  : 'bg-transparent text-slate-600 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/70'
              }
            `}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {tabs[activeTab]}
      </div>
    </div>
  );
};

export default TabbedControls;