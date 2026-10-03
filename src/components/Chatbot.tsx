import React, { useState, useRef, useEffect } from 'react';
import { Subject, AcademicLevel, TutorTone, ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SubjectIcon } from './SubjectIcon';
import {
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  BookMarked,
  HelpCircle,
  Lightbulb,
  Bot,
  User,
  SlidersHorizontal,
} from 'lucide-react';

interface ChatbotProps {
  currentSubject: Subject;
  academicLevel: AcademicLevel;
  messages: ChatMessage[];
  onSendMessage: (text: string, tone: TutorTone) => Promise<void>;
  onClearChat: () => void;
  onSaveToNotes: (content: string, title?: string) => void;
  onSendToSolver: (text: string) => void;
  isStreaming: boolean;
}

const TONES: { id: TutorTone; label: string; desc: string }[] = [
  { id: 'Balanced', label: 'Balanced Tutor', desc: 'Encouraging with clear explanations & examples' },
  { id: 'Socratic', label: 'Socratic Coach', desc: 'Asks guiding questions to help you figure it out' },
  { id: 'Concise & Exam Cram', label: 'Exam Cram', desc: 'Bullet points, formulas & high-yield takeaways' },
  { id: 'ELI5 (Simple Analogies)', label: 'ELI5 Analogies', desc: 'Simple everyday metaphors' },
];

export const Chatbot: React.FC<ChatbotProps> = ({
  currentSubject,
  academicLevel,
  messages,
  onSendMessage,
  onClearChat,
  onSaveToNotes,
  onSendToSolver,
  isStreaming,
}) => {
  const [input, setInput] = useState('');
  const [selectedTone, setSelectedTone] = useState<TutorTone>('Balanced');
  const [isToneMenuOpen, setIsToneMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput('');
    await onSendMessage(text, selectedTone);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .slice(0, 1000);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveNote = (id: string, content: string) => {
    onSaveToNotes(content, `${currentSubject.name} Explanation`);
    setSavedNoteId(id);
    setTimeout(() => setSavedNoteId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm animate-in fade-in duration-200">
      {/* Top Chat Bar: Subject context, Tutor tone picker, and New Chat */}
      <div className="px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
            <SubjectIcon name={currentSubject.icon} className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>{currentSubject.name} AI Tutor</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tuned for {academicLevel} • {selectedTone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tone Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsToneMenuOpen(!isToneMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">{selectedTone}</span>
              <span className="sm:hidden">Tone</span>
            </button>

            {isToneMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Choose Tutor Style
                </div>
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTone(t.id);
                      setIsToneMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all ${
                      selectedTone === t.id
                        ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[11px] text-slate-400">{t.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear / New Session Button */}
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors"
            title="Start new chat session"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State with Subject Starter Chips */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-xl">
              <Bot className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white">
              Hi! I'm your {currentSubject.name} AI Tutor
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Ask questions, discuss proofs, brainstorm essay angles, or check your working.
            </p>

            <div className="mt-6 w-full text-left">
              <div className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommended questions to explore:</span>
              </div>
              <div className="space-y-2">
                {currentSubject.quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSendMessage(prompt, selectedTone);
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-800/50 hover:bg-indigo-950/40 border border-slate-700/60 hover:border-indigo-500/50 text-left text-xs sm:text-sm text-slate-200 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-4 h-4 text-indigo-400 opacity-60 group-hover:opacity-100 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 max-w-4xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 border border-indigo-500/30 text-indigo-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 relative group transition-all text-sm ${
                    isUser
                      ? 'bg-indigo-600 text-white max-w-xl rounded-tr-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 max-w-2xl rounded-tl-none shadow-lg'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div>
                      <MarkdownRenderer content={msg.content} />

                      {/* Assistant Actions Bar */}
                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="p-1.5 rounded-lg hover:bg-slate-700/80 hover:text-white flex items-center gap-1 transition-colors"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">
                              {copiedId === msg.id ? 'Copied' : 'Copy'}
                            </span>
                          </button>

                          {/* Read Aloud Button */}
                          <button
                            onClick={() => handleSpeak(msg.id, msg.content)}
                            className="p-1.5 rounded-lg hover:bg-slate-700/80 hover:text-white flex items-center gap-1 transition-colors"
                            title={speakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                          >
                            {speakingId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">
                              {speakingId === msg.id ? 'Stop' : 'Listen'}
                            </span>
                          </button>

                          {/* Save to Study Notes */}
                          <button
                            onClick={() => handleSaveNote(msg.id, msg.content)}
                            className="p-1.5 rounded-lg hover:bg-slate-700/80 hover:text-white flex items-center gap-1 transition-colors"
                            title="Save explanation to Study Notes"
                          >
                            {savedNoteId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <BookMarked className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">
                              {savedNoteId === msg.id ? 'Saved' : 'Save to Notes'}
                            </span>
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Streaming Thinking Bubble */}
        {isStreaming && (
          <div className="flex gap-3 sm:gap-4 max-w-2xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-800/80 border border-slate-700/80 text-slate-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-xs text-indigo-300 font-medium">ScholarPulse is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a question in ${currentSubject.name}... (Press Enter to send, Shift+Enter for new line)`}
            className="w-full pl-4 pr-14 py-3 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none leading-relaxed transition-all shadow-inner"
            style={{ maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md shadow-indigo-600/30"
            title="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Active context: {currentSubject.name} ({academicLevel})</span>
          <span>Shift + Enter for multiline</span>
        </div>
      </div>
    </div>
  );
};
