import React, { useState } from 'react';
import { Subject, AcademicLevel, SolutionFormat, QuestionRecord } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SubjectIcon } from './SubjectIcon';
import {
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookMarked,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  History,
  Star,
  Layers,
  Lightbulb,
  FileQuestion,
  Send,
  Sliders,
} from 'lucide-react';

interface QuestionSolverProps {
  currentSubject: Subject;
  academicLevel: AcademicLevel;
  initialQuestion?: string;
  onSolveQuestion: (
    question: string,
    format: SolutionFormat,
    context?: string
  ) => Promise<string | null>;
  onSaveToNotes: (content: string, title?: string) => void;
  solvedHistory: QuestionRecord[];
  onToggleFavorite: (id: string) => void;
  isSolving: boolean;
}

const FORMAT_OPTIONS: { id: SolutionFormat; label: string; desc: string; icon: string }[] = [
  {
    id: 'step-by-step',
    label: 'Step-by-Step Breakdown',
    desc: 'Detailed intermediate steps, formula application, and final check',
    icon: 'Layers',
  },
  {
    id: 'deep-dive',
    label: 'Conceptual Deep-Dive',
    desc: 'The underlying theory, derivation, and physical/logical intuition',
    icon: 'Lightbulb',
  },
  {
    id: 'quick',
    label: 'Quick Solution',
    desc: 'Direct answer, key result, and concise verification for exam revision',
    icon: 'Sparkles',
  },
  {
    id: 'mcq',
    label: 'Multiple Choice Analyst',
    desc: 'Explains the correct choice and why every distractor is incorrect',
    icon: 'FileQuestion',
  },
];

export const QuestionSolver: React.FC<QuestionSolverProps> = ({
  currentSubject,
  academicLevel,
  initialQuestion = '',
  onSolveQuestion,
  onSaveToNotes,
  solvedHistory,
  onToggleFavorite,
  isSolving,
}) => {
  const [questionText, setQuestionText] = useState(initialQuestion);
  const [selectedFormat, setSelectedFormat] = useState<SolutionFormat>('step-by-step');
  const [currentSolution, setCurrentSolution] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'solver' | 'history'>('solver');
  const [searchHistory, setSearchHistory] = useState('');

  // Handle Solve execution
  const handleSolve = async (overrideText?: string) => {
    const textToSolve = overrideText || questionText;
    if (!textToSolve.trim() || isSolving) return;

    const res = await onSolveQuestion(textToSolve.trim(), selectedFormat);
    if (res) {
      setCurrentSolution(res);
    }
  };

  // Handle follow up query on the existing solution
  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || isSolving || !currentSolution) return;

    const combinedQuery = `Regarding the previous problem:\n"${questionText}"\n\nAnd its solution:\n${currentSolution.slice(
      0,
      400
    )}...\n\nFollow-up question from student: "${followUpQuestion}"`;

    const res = await onSolveQuestion(combinedQuery, 'step-by-step', 'Follow-up elaboration');
    if (res) {
      setCurrentSolution((prev) => `${prev}\n\n---\n\n### Follow-Up Q&A: ${followUpQuestion}\n${res}`);
      setFollowUpQuestion('');
    }
  };

  const handleCopySolution = () => {
    if (!currentSolution) return;
    navigator.clipboard.writeText(currentSolution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (!window.speechSynthesis || !currentSolution) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const cleanText = currentSolution.replace(/[#*`_~]/g, '').slice(0, 1000);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveToNotes = () => {
    if (!currentSolution) return;
    onSaveToNotes(currentSolution, `${currentSubject.name}: ${questionText.slice(0, 40)}...`);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  const filteredHistory = solvedHistory.filter(
    (item) =>
      item.question.toLowerCase().includes(searchHistory.toLowerCase()) ||
      item.solution.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Subtabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">AI Question Solver</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentSubject.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter any problem, equation, or code challenge for structured, verified solutions
            </p>
          </div>
        </div>

        {/* Tab Toggle: Solver vs History */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-800 border border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('solver')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'solver'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Solver Lab
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeSubTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({solvedHistory.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'history' ? (
        /* Solved History Screen */
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white">Solved Problems Archive</h2>
            <input
              type="text"
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              placeholder="Search previous questions or formulas..."
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No solved problems in history yet. Solve your first question in the Solver Lab!
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                          {item.format}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{item.question}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.isFavorite
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'border-slate-700 text-slate-500 hover:text-amber-300'
                        }`}
                        title="Star problem"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => {
                          setQuestionText(item.question);
                          setCurrentSolution(item.solution);
                          setActiveSubTab('solver');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        View Solution
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    {item.solution.slice(0, 200)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Solver Lab Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Problem Input & Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-lg space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                  <span>Enter Your Question or Exercise</span>
                  <span className="text-[11px] text-indigo-400 font-normal">
                    {currentSubject.name} • {academicLevel}
                  </span>
                </label>
                <textarea
                  rows={6}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={`Paste or type a problem in ${currentSubject.name}...\n\nExample: "Find the general solution to dy/dx + 2y = e^(-x)" or paste an essay prompt.`}
                  className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y leading-relaxed transition-all shadow-inner font-mono"
                />
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Solution Style & Depth
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedFormat(opt.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                        selectedFormat === opt.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-[11px] text-indigo-300 leading-tight">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Solve Button */}
              <button
                onClick={() => handleSolve()}
                disabled={!questionText.trim() || isSolving}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSolving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Analyzing & Solving Problem...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <span>Generate Complete Solution</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Load Subject Sample Problems */}
            <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-slate-400 mb-2 flex items-center justify-between">
                <span>Quick-Load Challenge Problems</span>
                <span className="text-[10px] text-slate-500">Curated for {currentSubject.name}</span>
              </div>
              <div className="space-y-2">
                {currentSubject.sampleProblems.map((prob, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestionText(prob.question);
                      handleSolve(prob.question);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <div className="overflow-hidden pr-2">
                      <div className="font-semibold text-slate-200 truncate">{prob.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{prob.question}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover:opacity-100 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Verified Solution Display & Follow-up (7 cols) */}
          <div className="lg:col-span-7">
            {currentSolution ? (
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-5">
                {/* Solution Top Action Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Verified AI Solution
                    </span>
                    <span className="text-xs text-slate-500 font-mono">• {selectedFormat}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    {/* Copy Solution */}
                    <button
                      onClick={handleCopySolution}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                      title="Copy complete solution"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    {/* Speech / Audio */}
                    <button
                      onClick={handleSpeech}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                      title={speaking ? 'Stop speech' : 'Listen to solution'}
                    >
                      {speaking ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span>{speaking ? 'Stop' : 'Listen'}</span>
                    </button>

                    {/* Save to Notes */}
                    <button
                      onClick={handleSaveToNotes}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 flex items-center gap-1 transition-colors"
                      title="Save to study notes"
                    >
                      {savedNote ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <BookMarked className="w-3.5 h-3.5" />
                      )}
                      <span>{savedNote ? 'Saved' : 'Save to Notes'}</span>
                    </button>
                  </div>
                </div>

                {/* Rendered Solution */}
                <div className="max-h-[520px] overflow-y-auto pr-2">
                  <MarkdownRenderer content={currentSolution} />
                </div>

                {/* Follow-up question bar */}
                <form
                  onSubmit={handleFollowUp}
                  className="pt-4 border-t border-slate-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    placeholder="Have a doubt? Ask a follow-up (e.g. 'Explain step 2 further' or 'What if x = 0?')"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!followUpQuestion.trim() || isSolving}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Empty Solution Placeholder */
              <div className="h-full min-h-[380px] rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-3">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Solution will appear here</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                  Type your problem on the left or click one of the quick challenge starters to see
                  step-by-step logic, formula derivations, and common pitfalls.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
