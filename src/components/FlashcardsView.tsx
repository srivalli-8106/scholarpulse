import React, { useState } from 'react';
import { Subject, Flashcard } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  BookMarked,
  Sparkles,
  RotateCw,
  Check,
  X,
  Lightbulb,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface FlashcardsViewProps {
  currentSubject: Subject;
  savedNotes: { id: string; title: string; content: string; timestamp: number }[];
  onDeleteNote: (id: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  currentSubject,
  savedNotes,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'notes'>('flashcards');
  const [topicInput, setTopicInput] = useState(currentSubject.topics[0] || 'Key Principles');
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: 'fc1',
      front: `Fundamental Theorem or Definition in ${currentSubject.name}`,
      back: `A central law or mathematical relation that describes how systems behave under specified boundary conditions.`,
      hint: 'Think about foundational laws and core definitions.',
      category: currentSubject.name,
      mastered: false,
    },
    {
      id: 'fc2',
      front: `Key Problem Solving Strategy`,
      back: `State known variables, identify governing equations, check dimensionality, and verify boundary limits.`,
      hint: 'First diagnostic step in solving challenges.',
      category: currentSubject.name,
      mastered: false,
    },
  ]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateCards = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.name,
          topic: topicInput,
          count: 4,
        }),
      });
      const data = await res.json();
      if (data.cards && data.cards.length > 0) {
        setFlashcards(
          data.cards.map((c: any, i: number) => ({
            id: `gen-${Date.now()}-${i}`,
            front: c.front,
            back: c.back,
            hint: c.hint,
            category: c.category || currentSubject.name,
            mastered: false,
          }))
        );
        setCardIndex(0);
        setIsFlipped(false);
        setShowHint(false);
      }
    } catch (err) {
      console.error('Flashcard generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleMastered = (status: boolean) => {
    setFlashcards((prev) =>
      prev.map((c, idx) => (idx === cardIndex ? { ...c, mastered: status } : c))
    );
    // Auto advance to next card
    if (cardIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setCardIndex((prev) => prev + 1);
    }
  };

  const currentCard = flashcards[cardIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner & Tab Toggle */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Active Recall & Study Notes</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review concepts with 3D flashcards and access saved problem solutions
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-800 border border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'flashcards'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Flashcards ({flashcards.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'notes'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Saved Notes ({savedNotes.length})
          </button>
        </div>
      </div>

      {activeTab === 'flashcards' ? (
        /* Flashcards Section */
        <div className="space-y-6">
          {/* Card Generator Input Bar */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={`Topic in ${currentSubject.name} (e.g. "${currentSubject.topics[0]}")`}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={handleGenerateCards}
              disabled={isGenerating || !topicInput.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate AI Cards</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Flip Flashcard */}
          {currentCard && (
            <div className="space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[280px] sm:min-h-[320px] rounded-3xl p-8 bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border-2 border-emerald-500/40 hover:border-emerald-500 shadow-2xl relative flex flex-col justify-between transition-all select-none group"
              >
                {/* Card Top Details */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {currentCard.category}
                  </span>
                  <span className="font-mono">
                    Card {cardIndex + 1} of {flashcards.length}
                  </span>
                </div>

                {/* Card Content (Front vs Back) */}
                <div className="my-auto py-4 text-center">
                  <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
                    {isFlipped ? 'Answer / Explanation' : 'Question / Concept'}
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white leading-relaxed max-w-xl mx-auto">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </h3>

                  {showHint && currentCard.hint && !isFlipped && (
                    <div className="mt-4 p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs inline-block">
                      Hint: {currentCard.hint}
                    </div>
                  )}
                </div>

                {/* Card Bottom Hint & Flip Action */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/60 text-xs text-slate-400">
                  {currentCard.hint && !isFlipped ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(!showHint);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-1.5 text-indigo-300 group-hover:text-white transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click card to flip</span>
                  </div>
                </div>
              </div>

              {/* Navigation & Mastery Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setShowHint(false);
                    setCardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={cardIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleMastered(false)}
                    className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Review Again</span>
                  </button>
                  <button
                    onClick={() => handleToggleMastered(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Mastered!</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setShowHint(false);
                    setCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                  }}
                  disabled={cardIndex === flashcards.length - 1}
                  className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Saved Notes Section */
        <div className="space-y-4">
          {savedNotes.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 text-sm">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No saved study notes yet.</p>
              <p className="text-xs text-slate-600 mt-1">
                Click "Save to Notes" on any AI Tutor chat or Question Solver explanation to save it
                here!
              </p>
            </div>
          ) : (
            savedNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">{note.title}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Saved {new Date(note.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(note.content);
                        setCopiedId(note.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                      title="Copy note content"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto pr-1">
                  <MarkdownRenderer content={note.content} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
