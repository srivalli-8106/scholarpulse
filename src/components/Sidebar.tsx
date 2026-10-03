import React from 'react';
import { ActiveTab, Subject } from '../types';
import { SubjectIcon } from './SubjectIcon';
import {
  LayoutDashboard,
  MessageSquare,
  HelpCircle,
  BrainCircuit,
  BookMarked,
  Timer,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentSubject: Subject;
  solvedCount: number;
  studyMinutes: number;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview, stats & study plan',
  },
  {
    id: 'chat',
    label: 'AI Tutor Chat',
    icon: MessageSquare,
    description: 'Socratic & conversational AI',
    badge: 'Live',
  },
  {
    id: 'solver',
    label: 'Question Solver',
    icon: HelpCircle,
    description: 'Step-by-step verified solutions',
    badge: 'Pro',
  },
  {
    id: 'quiz',
    label: 'Practice Quizzes',
    icon: BrainCircuit,
    description: 'Generative interactive quizzes',
  },
  {
    id: 'flashcards',
    label: 'Notes & Cards',
    icon: BookMarked,
    description: 'Active recall & saved solutions',
  },
  {
    id: 'pomodoro',
    label: 'Focus Room',
    icon: Timer,
    description: 'Pomodoro timer & study sounds',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentSubject,
  solvedCount,
  studyMinutes,
  isOpen,
  onClose,
}) => {
  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 lg:w-72 p-4 select-none">
      {/* Subject Spotlight Widget */}
      <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900/90 border border-indigo-500/20 shadow-inner">
        <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold mb-1.5">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Active Subject
          </span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[10px] text-indigo-300 uppercase tracking-wider">
            Context Active
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <SubjectIcon name={currentSubject.icon} className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-white text-sm truncate">{currentSubject.name}</div>
            <div className="text-xs text-slate-400 truncate">{currentSubject.topics[0]}</div>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Study Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 font-semibold ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                <div>
                  <div className="text-sm font-medium leading-none mb-1">{item.label}</div>
                  <div
                    className={`text-[11px] leading-none ${
                      isActive ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-500'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Mini Quick Stats Card */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Questions Solved</div>
            <div className="text-base font-extrabold text-white mt-0.5 font-mono">{solvedCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Study Focus</div>
            <div className="text-base font-extrabold text-indigo-300 mt-0.5 font-mono">{studyMinutes}m</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-50 w-72 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
