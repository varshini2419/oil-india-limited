import React from 'react';
import { Filter, Search, Sliders } from 'lucide-react';

export type SeverityFilter = 'ALL' | 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type CategoryFilter = 'ALL' | 'SRP' | 'CSS' | 'PREDICTIVE' | 'PRODUCTION' | 'AI_RISK';
export type ViewTab = 'ACTIVE' | 'HISTORY';

export interface EventFiltersProps {
  activeTab: ViewTab;
  onTabChange?: (tab: ViewTab) => void;
  setActiveTab?: (tab: ViewTab) => void;
  severityFilter: SeverityFilter;
  onSeverityChange?: (sev: SeverityFilter) => void;
  setSeverityFilter?: (sev: SeverityFilter) => void;
  categoryFilter: CategoryFilter;
  onCategoryChange?: (cat: CategoryFilter) => void;
  setCategoryFilter?: (cat: CategoryFilter) => void;
  searchQuery: string;
  onSearchChange?: (query: string) => void;
  setSearchQuery?: (query: string) => void;
  activeCount?: number;
  historyCount?: number;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  activeTab,
  onTabChange,
  setActiveTab,
  severityFilter,
  onSeverityChange,
  setSeverityFilter,
  categoryFilter,
  onCategoryChange,
  setCategoryFilter,
  searchQuery,
  onSearchChange,
  setSearchQuery,
  activeCount = 0,
  historyCount = 0,
}) => {
  const handleTabChange = (tab: ViewTab) => {
    if (onTabChange) onTabChange(tab);
    if (setActiveTab) setActiveTab(tab);
  };

  const handleSeverityChange = (sev: SeverityFilter) => {
    if (onSeverityChange) onSeverityChange(sev);
    if (setSeverityFilter) setSeverityFilter(sev);
  };

  const handleCategoryChange = (cat: CategoryFilter) => {
    if (onCategoryChange) onCategoryChange(cat);
    if (setCategoryFilter) setCategoryFilter(cat);
  };

  const handleSearchChange = (q: string) => {
    if (onSearchChange) onSearchChange(q);
    if (setSearchQuery) setSearchQuery(q);
  };

  const severities: SeverityFilter[] = ['ALL', 'NORMAL', 'WARNING', 'HIGH', 'CRITICAL'];
  const categories: CategoryFilter[] = ['ALL', 'SRP', 'CSS', 'PREDICTIVE', 'PRODUCTION', 'AI_RISK'];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 font-mono shadow-sm space-y-3">
      {/* Top View Toggle Tab (Active Alerts vs Event History) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => handleTabChange('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            ACTIVE ALERTS {activeCount > 0 ? `(${activeCount})` : ''}
          </button>
          <button
            onClick={() => handleTabChange('HISTORY')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            EVENT HISTORY {historyCount > 0 ? `(${historyCount})` : ''}
          </button>
        </div>

        {/* Text Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, parameters..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Filter Buttons Bar (Severity & Category) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Severity Filter Group */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-sky-500" /> SEVERITY:
          </span>
          {severities.map((sev) => (
            <button
              key={sev}
              onClick={() => handleSeverityChange(sev)}
              className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer border ${
                severityFilter === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : sev === 'HIGH'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : sev === 'WARNING'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : sev === 'NORMAL'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Category Filter Group */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-sky-500" /> MODULE:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer border ${
                categoryFilter === cat
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
