import React, { useState } from 'react';
import { Subject, StudyTask, QuestionRecord, ActiveTab } from '../types';
import { SUBJECTS } from '../data/subjects';
import { SubjectIcon } from './SubjectIcon';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ArrowRight,
  Clock,
  HelpCircle,
  MessageSquare,
  BrainCircuit,
  BookMarked,
  Lightbulb,
  Zap,
  BookOpen,
} from 'lucide-react';

interface DashboardProps {
  currentSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onStartQuestion: (question: string) => void;
  tasks: StudyTask[];
  onAddTask: (title: string, priority: 'high' | 'medium' | 'low') => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  solvedQuestions: QuestionRecord[];
  studyMinutes: number;
  streakDays: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentSubject,
  onSelectSubject,
  setActiveTab,
  onStartQuestion,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  solvedQuestions,
  studyMinutes,
  streakDays,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleQuickSolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onStartQuestion(quickInput.trim());
    setActiveTab('solver');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), newTaskPriority);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Student Assistant • Online</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Ready to master{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              {currentSubject.name}
            </span>{' '}
            today?
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Ask any question, get step-by-step problem breakdowns, chat with your Socratic AI tutor,
            or test your recall with interactive quizzes.
          </p>

          {/* Quick Problem Input Bar right inside the hero */}
          <form onSubmit={handleQuickSolveSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={`Ask or paste a problem in ${currentSubject.name} (e.g. "${currentSubject.sampleProblems[0]?.question.slice(0, 50)}...")`}
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono hidden sm:inline">
                Enter ↵
              </span>
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Solve with AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Study Time */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Study Time Today</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{studyMinutes}</span>
            <span className="text-xs text-slate-400">minutes</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <Zap className="w-3 h-3" />
            <span>Active Pomodoro Focus</span>
          </div>
        </div>

        {/* Card 2: Questions Solved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Problems Solved</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {solvedQuestions.length}
            </span>
            <span className="text-xs text-slate-400">total</span>
          </div>
          <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
            <span>Step-by-step breakdown</span>
          </div>
        </div>

        {/* Card 3: Study Streak */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Daily Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              {streakDays}
            </span>
            <span className="text-xs text-slate-400">days</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 font-medium">
            Keep learning daily!
          </div>
        </div>

        {/* Card 4: Tasks Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Study Tasks Done</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {completedTasksCount}
            </span>
            <span className="text-xs text-slate-400">/ {tasks.length}</span>
          </div>
          <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Active Subject Quick Actions + Study Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Subject Hub & Quick Launchers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Subject Control Card */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-md">
                  <SubjectIcon name={currentSubject.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    Current Focus Area
                  </div>
                  <h2 className="text-xl font-bold text-white">{currentSubject.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{currentSubject.description}</p>
                </div>
              </div>

              {/* Action Buttons for this subject */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat Tutor</span>
                </button>
                <button
                  onClick={() => setActiveTab('solver')}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Solve Problem</span>
                </button>
              </div>
            </div>

            {/* Quick Prompt Starters for this Subject */}
            <div className="mt-5">
              <div className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Tutor Questions (Click to ask AI)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentSubject.quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onStartQuestion(prompt);
                      setActiveTab('chat');
                    }}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-700/60 hover:border-indigo-500/50 text-left text-xs text-slate-300 hover:text-white transition-all group flex items-start gap-2"
                  >
                    <span className="text-indigo-400 font-mono mt-0.5">✦</span>
                    <span className="flex-1 leading-snug">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ready-to-solve sample problems */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center justify-between">
                <span>Sample Exam & Homework Challenges</span>
                <span className="text-[11px] text-indigo-400">Click to load in Solver</span>
              </div>
              <div className="space-y-2">
                {currentSubject.sampleProblems.map((prob, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onStartQuestion(prob.question);
                      setActiveTab('solver');
                    }}
                    className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="pr-4 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {prob.topic}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {prob.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{prob.question}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Switcher Grid - Full Browse */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">All Academic Disciplines</h3>
                <p className="text-xs text-slate-400">
                  Switch active context to adapt the AI tutor, solver, and practice quizzes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SUBJECTS.map((sub) => {
                const isActive = sub.id === currentSubject.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => onSelectSubject(sub)}
                    className={`p-3.5 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`p-2 rounded-xl ${
                          isActive
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <SubjectIcon name={sub.icon} className="w-4 h-4" />
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm leading-tight text-white">
                        {sub.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">
                        {sub.topics.length} topics
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Study Tasks & Fast AI Practice Tools */}
        <div className="space-y-6">
          {/* Quick Learning Shortcuts */}
          <div className="p-5 rounded-3xl bg-slate-800/40 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Smart Study Tools
            </h3>

            <button
              onClick={() => setActiveTab('quiz')}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-slate-900 border border-purple-500/30 hover:border-purple-500/60 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                    Practice Quiz
                  </div>
                  <div className="text-xs text-slate-400">Generate 3 questions on any topic</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/30 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    Active Recall Cards
                  </div>
                  <div className="text-xs text-slate-400">Review key formulas & definitions</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>

            <button
              onClick={() => setActiveTab('pomodoro')}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-cyan-900/30 to-slate-900 border border-cyan-500/30 hover:border-cyan-500/60 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                    Focus Pomodoro Room
                  </div>
                  <div className="text-xs text-slate-400">Timed sessions with study ambience</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          </div>

          {/* Today's Tasks & Deadlines */}
          <div className="p-5 rounded-3xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-white">Study Tasks & Deadlines</h3>
                <p className="text-xs text-slate-400">
                  {completedTasksCount} of {tasks.length} completed
                </p>
              </div>
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-colors"
                title="Add study task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Task Form */}
            {isAddingTask && (
              <form onSubmit={handleCreateTask} className="mb-3 p-3 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title (e.g. Finish Calculus pset 4)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px]">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTaskPriority(p)}
                        className={`px-2 py-0.5 rounded capitalize ${
                          newTaskPriority === p
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Task List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No tasks scheduled. Add one above!
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-slate-900/40 border-slate-800 text-slate-500'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="flex items-center gap-2.5 text-left flex-1 mr-2"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0 hover:text-indigo-400" />
                      )}
                      <span
                        className={`text-xs ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                          task.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-300'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Academic Insight Box */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Cognitive Study Tip</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Feynman Technique</strong>: Try explaining a concept to the AI chatbot in simple
              words, then ask the AI to point out any gaps or logical omissions in your reasoning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
