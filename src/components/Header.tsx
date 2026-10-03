import React, { useState, useRef, useEffect } from 'react';
import { Subject, AcademicLevel } from '../types';
import { SUBJECTS } from '../data/subjects';
import { SubjectIcon } from './SubjectIcon';
import {
  ChevronDown,
  Sparkles,
  Flame,
  Clock,
  BookOpen,
  GraduationCap,
  Play,
  Pause,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  currentSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  academicLevel: AcademicLevel;
  onChangeLevel: (level: AcademicLevel) => void;
  streakDays: number;
  pomodoroSeconds: number;
  isPomodoroRunning: boolean;
  onTogglePomodoro: () => void;
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

const ACADEMIC_LEVELS: AcademicLevel[] = [
  'High School',
  'College / Undergraduate',
  'Graduate / Advanced',
  'Foundations',
];

export const Header: React.FC<HeaderProps> = ({
  currentSubject,
  onSelectSubject,
  academicLevel,
  onChangeLevel,
  streakDays,
  pomodoroSeconds,
  isPomodoroRunning,
  onTogglePomodoro,
  onOpenMobileMenu,
  isMobileMenuOpen,
}) => {
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  const levelDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubjectDropdownOpen(false);
      }
      if (
        levelDropdownRef.current &&
        !levelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLevelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  ScholarPulse
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Smart Academic Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Center: Subject Selection Dropdown & Academic Level */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Subject Dropdown */}
          <div className="relative" ref={subjectDropdownRef}>
            <button
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 transition-all text-xs sm:text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse hidden sm:inline-block" />
              <div className="flex items-center gap-1.5 text-indigo-300">
                <SubjectIcon name={currentSubject.icon} className="w-4 h-4 text-indigo-400" />
                <span className="max-w-[110px] sm:max-w-none truncate">{currentSubject.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {isSubjectDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Select Study Subject
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {SUBJECTS.map((sub) => {
                    const isSelected = sub.id === currentSubject.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          onSelectSubject(sub);
                          setIsSubjectDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all text-left ${
                          isSelected
                            ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <SubjectIcon name={sub.icon} className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-200">{sub.name}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                              {sub.topics[0]}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Academic Level Dropdown */}
          <div className="relative hidden lg:block" ref={levelDropdownRef}>
            <button
              onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>{academicLevel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLevelDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-1.5 z-50">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Target Academic Depth
                </div>
                {ACADEMIC_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      onChangeLevel(lvl);
                      setIsLevelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      academicLevel === lvl
                        ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Pomodoro Timer & Streak */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mini Pomodoro Bar */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/70 rounded-xl px-2.5 py-1 text-xs">
            <button
              onClick={onTogglePomodoro}
              className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors"
              title={isPomodoroRunning ? 'Pause Study Timer' : 'Start Focus Timer'}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono font-semibold text-slate-200">
                {formatTimer(pomodoroSeconds)}
              </span>
              <div className="ml-1 p-0.5 rounded bg-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors">
                {isPomodoroRunning ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
              </div>
            </button>
          </div>

          {/* Study Streak */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold"
            title="Current study streak in days"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="hidden sm:inline font-mono">{streakDays}d Streak</span>
            <span className="sm:hidden font-mono">{streakDays}d</span>
          </div>
        </div>
      </div>
    </header>
  );
};
