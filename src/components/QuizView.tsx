import React, { useState } from 'react';
import { Subject, AcademicLevel, QuizQuestion } from '../types';
import confetti from 'canvas-confetti';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  Trophy,
  HelpCircle,
  Sliders,
} from 'lucide-react';

interface QuizViewProps {
  currentSubject: Subject;
  academicLevel: AcademicLevel;
}

export const QuizView: React.FC<QuizViewProps> = ({ currentSubject, academicLevel }) => {
  const [topic, setTopic] = useState(currentSubject.topics[0] || 'General Principles');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setQuizFinished(false);
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.name,
          topic,
          level: academicLevel,
          count: questionCount,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Quiz fetch error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optionIdx }));
    setShowExplanation((prev) => ({ ...prev, [qIdx]: true }));

    // Check if last question
    if (Object.keys(selectedAnswers).length + 1 >= questions.length) {
      setTimeout(() => {
        setQuizFinished(true);
        // Confetti celebration if scored well
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }, 800);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-inner">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">AI Practice Quiz Generator</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Reinforce understanding with conceptual multiple-choice challenges for {currentSubject.name}
            </p>
          </div>
        </div>

        {questions.length > 0 && (
          <button
            onClick={() => setQuestions([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Quiz Config</span>
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        /* Quiz Setup Form */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="max-w-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Choose Topic in {currentSubject.name}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {currentSubject.topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                      topic === t
                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Or type a custom topic..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Number of Practice Questions
              </label>
              <div className="flex items-center gap-3">
                {[3, 5, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      questionCount === num
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !topic.trim()}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Adaptive Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Practice Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : quizFinished ? (
        /* Quiz Completed Results Screen */
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Quiz Completed!</h2>
            <p className="text-sm text-slate-400 mt-1">Topic: {topic}</p>
          </div>

          <div className="inline-block p-6 rounded-3xl bg-slate-800/80 border border-slate-700">
            <div className="text-4xl font-black text-purple-300 font-mono">
              {calculateScore()} / {questions.length}
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Final Mastery Score (
              {Math.round((calculateScore() / questions.length) * 100)}%)
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSelectedAnswers({});
                setShowExplanation({});
                setQuizFinished(false);
                setCurrentIndex(0);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              Review Mistakes
            </button>
            <button
              onClick={handleGenerateQuiz}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30"
            >
              Try Another Set
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Display */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          {/* Question Index Progress */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <div className="font-semibold">
              Question <span className="text-purple-400 font-bold font-mono">{currentIndex + 1}</span> of{' '}
              <span className="font-mono">{questions.length}</span>
            </div>
            <div className="flex gap-1.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    idx === currentIndex
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : selectedAnswers[idx] !== undefined
                      ? 'bg-slate-800 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-3">
            <div className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQ?.question}
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ?.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                const hasAnswered = selectedAnswers[currentIndex] !== undefined;
                const isCorrect = optIdx === currentQ.correctIndex;

                let cardStyle =
                  'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white';
                if (hasAnswered) {
                  if (isCorrect) {
                    cardStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'bg-rose-950/40 border-rose-500 text-rose-200 font-semibold';
                  } else {
                    cardStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentIndex, optIdx)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-900/60 border border-slate-700/80 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {hasAnswered && (
                      <div>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Educational Explanation Box */}
          {showExplanation[currentIndex] && (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs sm:text-sm space-y-1.5 animate-in fade-in">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Concept Rationale:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Next / Previous Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setQuizFinished(true)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                View Final Score
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
